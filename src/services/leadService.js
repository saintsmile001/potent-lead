import axios from 'axios';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_URL;

/**
 * Trigger lead generation via n8n webhook.
 * Now includes batch_id so n8n can tag leads when writing back to Supabase.
 */
export const triggerLeadGeneration = async (userData) => {

  console.log("n8n webhook --- " , N8N_WEBHOOK_URL);
  try {
    const response = await axios.post(N8N_WEBHOOK_URL, {
      category: userData.category,
      location: userData.location,
      email: userData.email,
      requested_count: userData.count,
      user_id: userData.userId,
      batch_id: userData.batchId,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error("Connection to n8n failed:", error);
    throw error;
  }
};
