# rarecube.tv - Streaming Platform

<img src="Logo.jpeg" alt="Logo" width="400" height="400"/>

Welcome to rarecube.tv! This project utilizes Next.js 14, Livestreaming capabilities, React, Prisma, Stripe, Tailwind, and MongoDB to create a comprehensive streaming platform.

## Key Features

### 📡 Streaming using RTMP / WHIP protocols

- Utilize industry-standard RTMP (Real-Time Messaging Protocol) and WHIP (WebRTC HTTP Ingest Protocol) protocols for streaming live video content. These protocols ensure seamless transmission of video data from the source (e.g., OBS) to the streaming server, providing a reliable and efficient streaming experience.

### 🌐 Generating ingress

- Automatically generate ingress configurations to manage incoming network traffic for your streaming application. Ingress settings enable efficient routing and load balancing of incoming requests, ensuring optimal performance and scalability.

### 🔗 Connecting Next.js app to OBS / Your favorite streaming software

- Seamlessly integrate your Next.js application with popular streaming software such as OBS (Open Broadcaster Software) or other broadcasting tools. This integration allows content creators to easily stream live video directly from their Next.js application, providing a user-friendly streaming experience.

### 🔐 Authentication

- Implement robust authentication mechanisms to secure access to your streaming platform. Utilize authentication protocols such as OAuth, JWT (JSON Web Tokens), or OAuth to authenticate users, ensuring that only authorized individuals can access streaming features and content.

### 📸 Thumbnail upload

- Enable users to upload custom thumbnails for their live streams, enhancing the visual appeal and branding of their content. Custom thumbnails provide users with the flexibility to personalize their streams and attract viewers with eye-catching visuals.

### 👀 Live viewer count

- Display real-time viewer counts for live streams, allowing content creators to track the popularity and engagement of their broadcasts. Live viewer counts provide valuable insights into audience behavior and help creators optimize their content for maximum impact.

### 🚦 Live statuses

- Provide live status indicators for active streams, allowing users to easily identify and access live content. Live status indicators enhance user experience by highlighting ongoing streams and encouraging audience participation in real-time events.

### 💬 Real-time chat using sockets

- Implement real-time chat functionality using WebSocket technology, enabling users to engage in live discussions during streams. Real-time chat enhances viewer interaction and fosters a sense of community among stream participants, leading to a more immersive streaming experience.

### 🎨 Unique color for each viewer in chat

- Assign unique colors to individual users in the chat interface, making it easy to distinguish between different participants. Unique color identifiers enhance readability and visual clarity in chat conversations, improving communication and engagement among viewers.

### 👥 Following system

- Implement a follower system that allows users to follow their favorite content creators and receive notifications about their live streams. The following system fosters audience loyalty and enables creators to build a dedicated fan base, driving long-term engagement and growth.

### 🚫 Blocking system

- Enable content creators to block or mute disruptive users during live streams, maintaining a positive and inclusive streaming environment. The blocking system empowers creators to moderate their streams effectively and address unwanted behavior, ensuring a safe and enjoyable experience for all participants.

### 👢 Kicking participants from a stream in real-time

- Provide streamers with the ability to remove participants from their live streams in real-time, addressing disruptive behavior or enforcing community guidelines. The kicking feature allows creators to maintain control over their streams and ensure a respectful and enjoyable viewing experience for all participants.

### 🎛️ Streamer / Creator Dashboard

- Offer a dedicated dashboard for content creators to manage their live streams, monitor analytics, and interact with their audience. The streamer dashboard provides valuable insights and tools to help creators optimize their content, engage with viewers, and grow their audience effectively.

### 🐢 Slow chat mode

- Implement a slow chat mode that limits the frequency of messages in the chat interface, preventing spam and fostering more meaningful conversations. Slow chat mode encourages thoughtful engagement and enhances the overall chat experience for both creators and viewers.

### 🔒 Followers only chat mode

- Introduce a followers-only chat mode that restricts chat participation to users who follow the streamer, creating a more exclusive and intimate chat environment. Followers-only chat mode encourages audience engagement and rewards loyal viewers, enhancing the sense of community and connection within the stream.

### 📴 Enable / Disable chat

- Allow streamers to enable or disable chat functionality during their live streams, providing flexibility and control over the viewer interaction experience. Enabling or disabling chat gives creators the ability to tailor their streams to specific audiences or content types, ensuring a customized viewing experience for viewers.

### 🔽 Collapsible layout (hide sidebars, chat, etc., theater mode, etc.)

- Enable users to collapse or hide various interface elements such as sidebars, chat windows, or other components, providing a more immersive and distraction-free viewing experience. Collapsible layout options give users greater control over their viewing environment, allowing them to focus on the content without unnecessary clutter.

### 📚 Sidebar following & recommendations tab

- Implement a sidebar with following and recommendations tabs, allowing users to discover new content and connect with their favorite streamers. The sidebar provides personalized recommendations based on user preferences and viewing history, enhancing content discovery and user engagement.

### 🏠 Home page recommending streams, sorted by live first

- Design a home page that showcases recommended streams sorted by live status, highlighting ongoing broadcasts and popular content. The home page offers users a curated selection of live streams to explore, encouraging discovery and engagement with a diverse range of content.

### 🔍 Search results page with a different layout

- Create a search results page with a unique layout and interface, allowing users to find specific streams or content creators quickly and easily. The search results page provides relevant search suggestions and filters to streamline the discovery process and improve user experience.

### 🔄 Syncing user information to our DB using Webhooks

- Utilize webhooks to sync user information and updates to the database in real-time, ensuring accurate and up-to-date user data across the platform. Webhook integration enables seamless data synchronization and enhances the overall reliability and performance of the application.

### 📡 Syncing live status information to our DB using Webhooks

- Implement webhooks to sync live status information and stream updates to the database, enabling real-time monitoring and tracking of live streams. Webhook-based live status syncing ensures accurate and timely updates for streamers and viewers, enhancing the overall streaming experience.

### 🤝 Community tab

- Create a dedicated community tab where users can engage with each other, participate in discussions, and discover new communities and interests. The community tab fosters interaction and collaboration among users, building a vibrant and supportive community around the streaming platform.

### 🎨 Beautiful design

- Design a visually appealing and intuitive user interface with a focus on aesthetics and usability. A beautiful design enhances the overall user experience and reflects the platform's brand identity, attracting and retaining users with engaging and memorable visuals.

### ⚡ Blazing fast application

- Optimize the performance and responsiveness of the application to deliver a fast and seamless user experience. Blazing-fast application speed ensures smooth navigation, quick page loads, and minimal latency, providing users with an enjoyable and hassle-free streaming experience.

### 📄 SSR (Server-Side Rendering)

- Implement server-side rendering (SSR) to generate dynamic web pages on the server and deliver them to the client, enhancing performance and SEO-friendliness. SSR improves page load times and ensures that content is accessible to search engines, maximizing visibility and reach for the platform.

### 🗺️ Grouped routes & layouts

- Organize routes and layouts into logical groups to streamline navigation and enhance user experience. Grouped routes and layouts provide a clear and intuitive structure for the application, making it easy for users to explore and interact with different sections and features.

### 🗃️ MongoDB

- Utilize MongoDB as the database solution to store and manage user data, stream information, and other application resources. MongoDB offers flexibility, scalability, and performance, enabling efficient data storage and retrieval for the streaming platform.

### 🚀 Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcloutprotocol%2Ftwitch-clone&env=DATABASE_URL,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,CLERK_WEBHOOK_SECRET,LIVEKIT_API_URL,LIVEKIT_API_KEY,LIVEKIT_API_SECRET,NEXT_PUBLIC_LIVEKIT_WS_URL,UPLOADTHING_SECRET,UPLOADTHING_APP_ID,BAGS_API_KEY,SOLANA_RPC_URL,HELIUS_API_KEY,NEXT_PUBLIC_SOLANA_RPC_URL,NEXTAUTH_SECRET,NEXTAUTH_URL&envDescription=Required%20environment%20variables%20for%20the%20streaming%20platform&envLink=https%3A%2F%2Fgithub.com%2Fcloutprotocol%2Ftwitch-clone%23environment-variables&project-name=rarecube-streaming&repository-name=rarecube-streaming)

Deploy the application to a production environment to make it accessible to users worldwide. The platform is optimized for Vercel deployment with automatic builds, serverless functions, and global CDN distribution.

## Prerequisites

- Node version 18.17 or later

## Cloning the repository

```bash
git clone https://github.com/cloutprotocol/twitch-clone.git
```

## Installation

```bash
npm install
```

## Setup

Create a `.env` file in the root directory and add the following environment variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_WEBHOOK_SECRET=

DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/database

LIVEKIT_API_URL=https://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
NEXT_PUBLIC_LIVEKIT_WS_URL=wss://your-project.livekit.cloud

UPLOADTHING_SECRET=sk_live_your_secret
UPLOADTHING_APP_ID=your_app_id

# Solana & Token Integration
BAGS_API_KEY=bags_prod_your_key
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_key
HELIUS_API_KEY=your_helius_key
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_key

# NextAuth.js
NEXTAUTH_SECRET=your_secure_secret
NEXTAUTH_URL=http://localhost:3000
```

## Setup Database

The application uses **MongoDB** (not MySQL). Database setup varies by environment:

### Local Development
```bash
npx prisma generate
npx prisma db push
```

### Production (Vercel)
The database is already configured with MongoDB Atlas. Prisma will automatically generate during deployment via the `postinstall` script.

## Starting the app

```bash
npm run dev
```

## Available Commands

Running commands with npm: `npm run [command]`

| Command | Description                              |
| ------- | ---------------------------------------- |
| dev     | Starts a development instance of the app |
| build   | Creates optimized production build       |
| start   | Runs the production build                |
| lint    | Runs ESLint for code quality checks     |

## 🚀 Production Deployment

### Quick Deploy to Vercel

1. **One-Click Deploy**: Click the "Deploy with Vercel" button above
2. **Environment Variables**: Add the required environment variables in Vercel dashboard
3. **Database**: Already configured with MongoDB Atlas
4. **Domain**: Your app will be live at `https://your-project.vercel.app`

### Manual Deployment Steps

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/cloutprotocol/twitch-clone.git
   cd twitch-clone
   ```

2. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Configure Environment Variables**
   
   Copy variables from `.env.production` template to Vercel dashboard:
   
   - Navigate to your Vercel project → Settings → Environment Variables
   - Add all variables from the template
   - Update LiveKit to use cloud service for production
   - Use production Clerk keys
   - Generate secure NEXTAUTH_SECRET (32+ characters)

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables

#### Required Services Setup:

1. **MongoDB Atlas**: Already configured ✅
2. **Clerk**: Get production keys from [clerk.dev](https://clerk.dev)  
3. **LiveKit**: Sign up at [livekit.io](https://livekit.io) for cloud service
4. **UploadThing**: Get keys from [uploadthing.com](https://uploadthing.com)
5. **Helius**: Get RPC key from [helius.dev](https://helius.dev)
6. **BAGS SDK**: Get API key from BAGS protocol

#### Production Checklist:

- [ ] MongoDB Atlas connection string added
- [ ] Clerk production keys configured
- [ ] LiveKit Cloud service configured (not VPS)
- [ ] UploadThing production keys added
- [ ] Helius API key for Solana RPC
- [ ] BAGS API key for token features
- [ ] NEXTAUTH_SECRET (32+ random characters)
- [ ] NEXTAUTH_URL set to your domain
- [ ] All webhooks updated to production URLs

### Performance & Security

- ✅ **Server-Side Rendering (SSR)** enabled
- ✅ **Serverless Functions** for API routes
- ✅ **Global CDN** distribution via Vercel
- ✅ **Automatic HTTPS** and security headers
- ✅ **Database connection pooling** configured
- ✅ **Image optimization** enabled
