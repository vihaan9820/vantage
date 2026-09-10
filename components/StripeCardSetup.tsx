import { useState, useEffect, type FormEvent } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Lock, CheckCircle2, AlertCircle } from "lucide-react";

// Initialize Stripe instance with publishable key
const publishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_TYooMQauvdEDq54NiTphI7jx"; // fallback test key if not set in .env
const stripePromise = loadStripe(publishableKey);

function SavePaymentMethodForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: (setupIntentId: string) => void;
  onCancel?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage("");

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: window.location.href,
      },
    });

    if (error) {
      setErrorMessage(error.message || "Failed to save card. Please check details.");
      setLoading(false);
    } else if (setupIntent && setupIntent.status === "succeeded") {
      setIsSuccess(true);
      setLoading(false);
      if (onSuccess) {
        onSuccess(setupIntent.id);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 size={24} />
        </div>
        <h4 className="text-base font-bold text-white">Payment Method Saved</h4>
        <p className="text-xs text-slate-400">
          Your card has been saved securely for quick, one-click future sessions.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 font-semibold text-xs bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
        >
          <Lock size={14} />
          {loading ? "Encrypting & saving card…" : "Save card for future bookings"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full min-h-[38px] text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function StripeCardSetup({
  email,
  userId,
  onSuccess,
  onCancel,
}: {
  email?: string;
  userId?: string;
  onSuccess?: (setupIntentId: string) => void;
  onCancel?: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stripe/create-setup-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Failed to initialize Stripe session");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to reach payment server");
      });
  }, [email, userId]);

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400 space-y-2">
        <p className="text-red-400 font-semibold">{error}</p>
        <p>Ensure `STRIPE_SECRET_KEY` is set in your server environment.</p>
        {onCancel && (
          <button onClick={onCancel} className="text-cyan-400 underline text-xs pt-2">
            Go back
          </button>
        )}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
        Initializing secure card vault...
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#00f0ff",
            colorBackground: "#0b1127",
            colorText: "#eff6ff",
            colorDanger: "#f87171",
            borderRadius: "10px",
          },
        },
      }}
    >
      <SavePaymentMethodForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
