package io.github.socketrocketdocket.playwizard;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin {
    private BillingClient billingClient;
    private PluginCall pendingPurchaseCall;
    private String pendingProductId;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this::onPurchasesUpdated)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
            )
            .build();
    }

    private void withConnection(Runnable onReady, PluginCall call) {
        if (billingClient == null) {
            call.reject("Billing client unavailable");
            return;
        }
        if (billingClient.isReady()) {
            onReady.run();
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    onReady.run();
                } else {
                    call.reject("Google Play Billing unavailable: " + result.getDebugMessage());
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Next call will automatically reconnect
            }
        });
    }

    @PluginMethod
    public void getProduct(PluginCall call) {
        String productId = call.getString("productId", "pro_launch_kit");
        withConnection(() -> {
            QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(product))
                .build();

            billingClient.queryProductDetailsAsync(params, (result, list) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || list == null || list.isEmpty()) {
                    call.reject("Product not found in Play Console yet: " + productId);
                    return;
                }
                ProductDetails d = list.get(0);
                JSObject ret = new JSObject();
                ret.put("productId", d.getProductId());
                ret.put("title", d.getName());
                ret.put("description", d.getDescription());
                if (d.getOneTimePurchaseOfferDetails() != null) {
                    ret.put("price", d.getOneTimePurchaseOfferDetails().getFormattedPrice());
                }
                call.resolve(ret);
            });
        }, call);
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId", "pro_launch_kit");
        withConnection(() -> {
            QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
            QueryProductDetailsParams params = QueryProductDetailsParams.newBuilder()
                .setProductList(Collections.singletonList(product))
                .build();

            billingClient.queryProductDetailsAsync(params, (result, list) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || list == null || list.isEmpty()) {
                    JSObject ret = new JSObject();
                    ret.put("unlocked", false);
                    ret.put("status", "unavailable");
                    ret.put("message", "Product '" + productId + "' is not active in Play Console yet.");
                    call.resolve(ret);
                    return;
                }
                ProductDetails details = list.get(0);
                BillingFlowParams.ProductDetailsParams pdp = BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(details)
                    .build();
                BillingFlowParams flowParams = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Collections.singletonList(pdp))
                    .build();

                pendingPurchaseCall = call;
                pendingProductId = productId;

                getActivity().runOnUiThread(() -> {
                    BillingResult launchResult = billingClient.launchBillingFlow(getActivity(), flowParams);
                    if (launchResult.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        PluginCall c = pendingPurchaseCall;
                        pendingPurchaseCall = null;
                        if (c != null) {
                            JSObject ret = new JSObject();
                            ret.put("unlocked", false);
                            ret.put("status", "error");
                            ret.put("message", launchResult.getDebugMessage());
                            c.resolve(ret);
                        }
                    }
                });
            });
        }, call);
    }

    @PluginMethod
    public void restore(PluginCall call) {
        String productId = call.getString("productId", "pro_launch_kit");
        withConnection(() -> {
            QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
            billingClient.queryPurchasesAsync(params, (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject("Could not query purchases: " + result.getDebugMessage());
                    return;
                }
                boolean owned = false;
                if (purchases != null) {
                    for (Purchase p : purchases) {
                        if (p.getPurchaseState() == Purchase.PurchaseState.PURCHASED
                            && p.getProducts().contains(productId)) {
                            owned = true;
                            acknowledgeIfNeeded(p, null);
                        }
                    }
                }
                JSObject ret = new JSObject();
                ret.put("unlocked", owned);
                call.resolve(ret);
            });
        }, call);
    }

    private void onPurchasesUpdated(@NonNull BillingResult result, @Nullable List<Purchase> purchases) {
        PluginCall call = pendingPurchaseCall;
        String targetId = pendingProductId != null ? pendingProductId : "pro_launch_kit";
        pendingPurchaseCall = null;
        pendingProductId = null;

        int code = result.getResponseCode();
        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase p : purchases) {
                if (p.getProducts().contains(targetId) && p.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    acknowledgeIfNeeded(p, () -> {
                        if (call != null) {
                            JSObject ret = new JSObject();
                            ret.put("unlocked", true);
                            ret.put("status", "purchased");
                            call.resolve(ret);
                        }
                    });
                    return;
                }
            }
            if (call != null) {
                JSObject ret = new JSObject();
                ret.put("unlocked", false);
                ret.put("status", "pending");
                ret.put("message", "Purchase is pending approval.");
                call.resolve(ret);
            }
        } else if (code == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            if (call != null) {
                JSObject ret = new JSObject();
                ret.put("unlocked", true);
                ret.put("status", "already_owned");
                call.resolve(ret);
            }
        } else if (call != null) {
            JSObject ret = new JSObject();
            ret.put("unlocked", false);
            ret.put("status", code == BillingClient.BillingResponseCode.USER_CANCELED ? "cancelled" : "error");
            ret.put("message", code == BillingClient.BillingResponseCode.USER_CANCELED
                ? "Purchase cancelled."
                : result.getDebugMessage());
            call.resolve(ret);
        }
    }

    private void acknowledgeIfNeeded(Purchase purchase, @Nullable Runnable onDone) {
        if (purchase.isAcknowledged()) {
            if (onDone != null) onDone.run();
            return;
        }
        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.getPurchaseToken())
            .build();
        billingClient.acknowledgePurchase(params, r -> {
            if (onDone != null) onDone.run();
        });
    }

    @Override
    protected void handleOnDestroy() {
        if (billingClient != null) {
            billingClient.endConnection();
        }
        super.handleOnDestroy();
    }
}
