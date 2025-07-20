const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("REACT_APP_API_BASE_URL is not defined in frontend/.env");
    
}

/**
 * Sends a text-only prompt to the Gemini AI via the Flask backend.
 * @param {string} prompt The text message or query to send to Gemini.
 * @returns {Promise<object>} A promise that resolves to the JSON response from the backend.
 * @throws {Error} If the network request fails or the backend returns an error.
 */
export async function chatWithGemini(prompt) {
    const response = await fetch(`${API_BASE_URL}/api/chat-with-gemini`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get Gemini reply.');
    }
    return response.json();
}

/**
 * Uploads an image file and an optional text prompt for multimodal analysis by Gemini AI
 * via the Flask backend.
 * @param {File} imageFile The image file object to upload (e.g., from an <input type="file">).
 * @param {string} textPrompt An optional text description or question to accompany the image.
 * @returns {Promise<object>} A promise that resolves to the JSON response from the backend.
 * @throws {Error} If the network request fails or the backend returns an error.
 */
export async function uploadImageForAnalysis(imageFile, textPrompt) {
    
    const formData = new FormData();
    formData.append('image', imageFile); 
    formData.append('text_prompt', textPrompt); 

    const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
        method: 'POST',
        
        body: formData,
    });

    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image and text.');
    }
    return response.json(); 
}