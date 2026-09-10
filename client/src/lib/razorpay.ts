export type RazorpayPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayOptions = {
  amountInRupees: number;
  name?: string;
  description?: string;
  userEmail?: string;
  userName?: string;
  userContact?: string;
  notes?: Record<string, string>;
  onSuccess: (response: RazorpayPaymentResponse) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: RazorpayOptions) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
  }

  // 1. Create order on the server
  const orderRes = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: options.amountInRupees,
      currency: "INR",
      notes: options.notes,
    }),
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.orderId) {
    throw new Error(orderData.error || "Failed to initiate payment order");
  }

  // 2. Configure Razorpay Standard Checkout
  const rzpOptions = {
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency || "INR",
    name: options.name || "SkillSwap Learning",
    description: options.description || "Skill Points Top-up",
    order_id: orderData.orderId,
    prefill: {
      name: options.userName || "",
      email: options.userEmail || "",
      contact: options.userContact || "",
    },
    theme: {
      color: "#00f0ff",
    },
    modal: {
      ondismiss: () => {
        if (options.onDismiss) options.onDismiss();
      },
    },
    handler: async (response: RazorpayPaymentResponse) => {
      try {
        // 3. Verify payment signature on backend
        const verifyRes = await fetch("/api/razorpay/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.verified) {
          options.onSuccess(response);
        } else {
          if (options.onError) {
            options.onError(new Error(verifyData.error || "Payment signature verification failed"));
          }
        }
      } catch (err) {
        if (options.onError) options.onError(err);
      }
    },
  };

  const razorpayInstance = new (window as any).Razorpay(rzpOptions);
  razorpayInstance.on("payment.failed", (res: any) => {
    if (options.onError) options.onError(res.error);
  });

  razorpayInstance.open();
}
