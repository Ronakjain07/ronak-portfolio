exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Get the secret keys from Netlify's environment variables
  const TELEGRAM_BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID;

  // Parse the message from the request
  const data = JSON.parse(event.body);
  const { name, email, message } = data; // UPDATED

  if (!name || !email || !message) {
    // UPDATED
    return { statusCode: 400, body: "Name, email, and message are required." };
  }

  // Format the message text
  const text = `New message from portfolio:\n\n*From:* ${name}\n*Email:* ${email}\n*Message:* ${message}`; // UPDATED

  // The URL to send the message to the Telegram API
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    // Send the message
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent successfully" }),
    };
  } catch (error) {
    console.error("Error sending message to Telegram:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send message" }),
    };
  }
};
