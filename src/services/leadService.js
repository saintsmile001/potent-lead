import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://potentra.app.n8n.cloud/webhook-test/potent-lead';

/**
 * Trigger lead generation via n8n webhook.
 * Now includes batch_id so n8n can tag leads when writing back to Supabase.
 */
export const triggerLeadGeneration = async (userData) => {
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
