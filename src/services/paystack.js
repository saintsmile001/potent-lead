export const initializePaystack = (config) => {
  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: config.email,
    amount: Math.floor(config.amount * 100), // Naira to Kobo
    currency: 'NGN',
    // Metadata is the key for production grade tracking
    metadata: {
      custom_fields: [
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: config.userId
        },
        {
          display_name: "Leads Purchased",
          variable_name: "leads_to_add",
          value: config.leads
        }
      ]
    },
    callback: (response) => {
      // In production, we don't add credits here!
      // We just show a "Processing" message.
      console.log('Transaction reference:', response.reference);
      if (config.onSuccess) config.onSuccess();
    },
    onClose: () => {
      console.log('Payment modal closed');
    }
  });
  handler.openIframe();
};
