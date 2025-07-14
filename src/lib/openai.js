export const improveAboutMe = async (aboutMeText) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const prompt = `
    You are an expert English writing assistant.
    Given this About Me text: "${aboutMeText}"
    - Correct grammar and spelling
    - Make it more natural and professional
    - Keep the tone friendly
    - Return ONLY the improved About Me text, nothing else.
    `;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini", 
            messages: [
                { role: "system", content: "You are an expert English assistant." },
                { role: "user", content: prompt }
            ],
            temperature: 0.6
        })
    });

    if (!res.ok) {
        console.error("OpenAI API error:", await res.text());
        return null;
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content.trim();
    console.log("GPT response:", raw);
    return raw;
};



export const generatePortfolio = async (userInput) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;


    const premiumUser = (userInput.lan === 'premium' || userInput.role === 'admin');

    const availableLayouts = premiumUser
        ? `
    Header: ["Centered", "Modern", "Split", "Highlight"]
    AboutMe: ["Centered", "Interactive", "LeftAligned", "CardStack"]
    Projects: ["Grid", "Masonry", "List"]
    Contact: ["Cards", "Inline", "Stacked"]
    ProfileImage: ["Circle", "Framed", "Polaroid"]
    WorkExperience: ["Timeline","Cards","Compact"]
    `
        : `
    Header: ["Centered", "Split", "Highlight"]
    AboutMe: ["Interactive", "LeftAligned", "CardStack"]
    Projects: ["Grid", "Masonry"]
    Contact: ["Cards", "Inline"]
    ProfileImage: ["Circle", "Framed"]
    WorkExperience: ["Timeline","Cards","Compact"]
    `;

    const prompt = `
{
"You are an AI assistant. When I ask for layouts, respond with JSON only—no extra words."
{
Available themes:
['Slate', 'Forest', 'Sunset', 'Blossom', 'Steel', 'Earth', 'Neon', 'Ocean', 'Royal']

Available section layouts:
${availableLayouts}

Based on the user's profession "${userInput.title}" and about him: "${userInput.aboutMe}", Choose the BEST layout for each section and color theme"

Return JSON EXACTLY:
{
  "theme": "string",
  "layouts": {
      "Header": "string",
      "AboutMe": "string",
      "Projects": "string",
      "Contact": "string",
      "ProfileImage": "string",
      "WorkExperience": "string",
  }
}
}
},`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are an AI portfolio assistant." },
                { role: "user", content: prompt }
            ],
            temperature: 0
        })
    });

    if (!res.ok) {
        console.error("OpenAI API error:", await res.text());
        return null;
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;
    console.log("GPT response:", raw);

    try {
        return JSON.parse(raw);
    } catch (err) {
        console.error("JSON parse error:", err);
        return null;
    }
};

