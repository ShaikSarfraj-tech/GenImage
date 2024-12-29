// import express from "express";
// import * as dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();

// router.route("/").get((req, res) => {
//     res.send("Hello from DALL-E");
// });

// router.route("/").post(async (req, res) => {
//     try {
//         const { prompt } = req.body;
//         // const aiResponse = await fetch("https://api.monsterapi.ai/v1/text-to-image", {
//         //     method: "POST",
//         //     headers: {
//         //         "Content-Type": "application/json",
//         //         "Authorization": `Bearer ${process.env.MONSTER_API_KEY}`
//         //     },
//         //     body: JSON.stringify({
//         //         prompt: prompt,
//         //         size: "512x512", // Optional, customize as needed
//         //         style: "default" // Optional, choose the desired style
//         //     })
//         // });
//         // console.log(aiResponse);

//         const url = 'https://api.monsterapi.ai/v1/generate/txt2img';
//         const options = {
//             method: 'POST',
//             headers: { accept: 'application/json', 'content-type': 'application/json', 'Authorization': `Bearer ${process.env.MONSTER_API_KEY}` },
//             body: JSON.stringify({ safe_filter: true, prompt: prompt })
//         };

//         const response = await fetch(url, options)

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();

//         console.log(data);


//         fetch(`https://api.monsterapi.ai/v1/status/${data.process_id}`
//             , {
//                 method: "GET",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${process.env.MONSTER_API_KEY}`
//                 }
//             })
//             .then(res => res.json())
//             .then(json => console.log(json))
//             .catch(err => console.error(err));

//         // const data = await aiResponse.json();
//         // console.log(data);
//         // const image = data.images[0];
//         // res.status(200).json({ photo: image });

//         // res.status(200).json({ photo: image });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send(error?.response.data.error.message);
//     }
// });

// export default router;


import express from "express";
import * as dotenv from "dotenv";
import fetch from "node-fetch"; // Use node-fetch for simplicity

dotenv.config();

const router = express.Router();

router.route("/").get((req, res) => {
    res.send("Hello from MonsterAPI");
});

router.route("/").post(async (req, res) => {
    try {
        const { prompt } = req.body;

        // Step 1: Submit the request to MonsterAPI
        const submitResponse = await fetch("https://api.monsterapi.ai/v1/generate/txt2img", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.MONSTER_API_KEY}`
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });

        const submitData = await submitResponse.json();

        console.log(submitData);

        if (!submitResponse.ok) {
            return res.status(submitResponse.status).json(submitData);
        }

        const { process_id, status_url } = submitData;

        // Step 2: Poll the status endpoint
        let status = "IN_PROGRESS";
        let result = null;

        while (status === "IN_PROGRESS" || status === "IN_QUEUE") {
            const statusResponse = await fetch(status_url, {
                headers: {
                    "Authorization": `Bearer ${process.env.MONSTER_API_KEY}`
                }
            });

            const statusData = await statusResponse.json();

            if (!statusResponse.ok) {
                return res.status(statusResponse.status).json(statusData);
            }

            status = statusData.status;

            if (status === "COMPLETED") {
                result = statusData.result;
                console.log(result);
                break;
            } else if (status === "FAILED") {
                return res.status(500).json({ error: "Image generation failed." });
            }

            // Wait for a short period before polling again
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
        }

        // Step 3: Return the result
        if (result && result.output && result.output.length > 0) {
            res.status(200).json({ photo: result.output[0] });
        } else {
            res.status(500).json({ error: "No output received from MonsterAPI." });
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send(error.message || "An error occurred while generating the image.");
    }
});

export default router;
