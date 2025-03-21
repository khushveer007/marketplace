# VA Hiring Marketplace 🚀

![Marketplace Banner](https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

<div align="center">
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#configuration">Configuration</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>
</div>

<div align="center">
  <p><strong>Connect with skilled virtual assistants from around the world. Post jobs, find talent, and grow your business with our marketplace.</strong></p>
</div>

## ✨ Features

<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">

### 🌐 For Businesses and Hirers

- **Job Posting** - Create detailed job listings specifying requirements, rates, and time zones
- **Talent Search** - Find virtual assistants with specific skills and availability
- **Secure Communication** - Built-in messaging system to discuss projects
- **Profile Management** - Manage your business profile and job listings

### 👨‍💻 For Virtual Assistants

- **Job Discovery** - Browse available jobs filtered by skills and preferences
- **Profile Showcase** - Create a professional profile highlighting skills and experience
- **Time Zone Management** - Work with clients across different time zones
- **Hourly Rate Settings** - Set your own competitive rates

</div>

<div align="center">
  <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Virtual Assistant Working" width="80%"/>
</div>

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center" width="96">
      <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/react/react.png" width="48" height="48" alt="React" />
      <br>React
    </td>
    <td align="center" width="96">
      <img src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/tailwind/tailwind.png" width="48" height="48" alt="Tailwind" />
      <br>Tailwind
    </td>
    <td align="center" width="96">
      <img src="https://user-images.githubusercontent.com/24623425/36042969-f87531d4-0d8a-11e8-9dee-e87ab8c6a9e3.png" width="48" height="48" alt="PostgreSQL" />
      <br>PostgreSQL
    </td>
    <td align="center" width="96">
      <img src="https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png" width="48" height="48" alt="Supabase" />
      <br>Supabase
    </td>
    <td align="center" width="96">
      <img src="https://www.svgrepo.com/show/376339/netlify.svg" width="48" height="48" alt="Netlify" />
      <br>Netlify
    </td>
  </tr>
</table>

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0+)
- npm or yarn
- Supabase account
- Environment variables setup

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/va-hiring-marketplace.git

# Navigate to the project directory
cd va-hiring-marketplace

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start the development server
npm start
```

The application will be available at `http://localhost:3000`.

<div style="background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%); padding: 20px; border-radius: 10px; margin: 20px 0;">
<h3>📱 Application Structure</h3>
<pre>
marketplace/
├── public/          # Static files
├── src/
│   ├── lib/         # Utilities and API clients
│   ├── pages/       # Main application pages
│   │   ├── Account.js
│   │   ├── JobList.js
│   │   ├── LandingPage.js
│   │   └── Login.js
│   ├── App.js       # Application routes
│   ├── index.js     # Entry point
│   └── index.css    # Global styles
├── .env             # Environment variables (create from .env.example)
└── tailwind.config.js # Tailwind CSS configuration
</pre>
</div>

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_MAKE_WEBHOOK_URL=your_webhook_url (optional)
```

### Database Setup

The project uses Supabase for authentication and database. You need to:

1. Create a Supabase project
2. Run the SQL setup script in `supabase.sql` which creates:
   - profiles table
   - jobs table
   - necessary policies for row-level security
   - triggers for user creation

<div align="center">
  <img src="https://images.unsplash.com/photo-1484417894907-623942c8ee29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Database Diagram" width="80%"/>
</div>

## 🌐 Deployment

The application is configured for deployment on Netlify:

1. Connect your GitHub repository to Netlify
2. Configure the build settings:
   - Build command: `CI=false npm run build`
   - Publish directory: `build`
3. Add the environment variables in the Netlify dashboard
4. Deploy!

The `netlify.toml` file in the repository already includes the necessary configuration for proper routing with React Router.

## 🧪 Key Features Implementation

### Authentication Flow

The application uses Supabase Auth for user authentication:

```javascript
// Login
const { error } = await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password,
});

// Sign up
const { error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      full_name: formData.fullName,
      user_type: formData.userType,
    },
  },
});
```

### Job Posting System

Hirers can create job postings which become visible to virtual assistants:

```javascript
// Create job
const newJob = {
  user_id: user.id,
  title: formData.title,
  description: formData.description,
  assistant_type: formData.assistantType,
  hourly_rate: formData.hourlyRate,
  time_zone: formData.timeZone,
  created_at: new Date(),
};

const { data, error } = await supabase
  .from('jobs')
  .insert(newJob)
  .select();
```

<div style="background: linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%); padding: 20px; border-radius: 10px; margin: 20px 0;">
<h3>🔮 Future Enhancements</h3>
<ul>
  <li>In-app messaging system</li>
  <li>Advanced search filters</li>
  <li>Payment gateway integration</li>
  <li>Dispute resolution system</li>
  <li>Rating and review system</li>
  <li>Enhanced portfolio displays for VAs</li>
</ul>
</div>

## 👥 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's style guidelines and includes appropriate tests.

## 📬 Stay Connected

Join our community and stay up to date with the latest developments:

<div align="center" style="display: flex; justify-content: center; gap: 20px; margin: 30px 0;">
  <a href="https://instagram.com/vahiring" style="text-decoration: none;">
    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/instagram.svg" width="40" height="40" alt="Instagram"/>
    <p>Instagram</p>
  </a>
  <a href="https://t.me/vahiringmarketplace" style="text-decoration: none;">
    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/telegram.svg" width="40" height="40" alt="Telegram"/>
    <p>Telegram</p>
  </a>
  <a href="https://x.com/vahiring" style="text-decoration: none;">
    <img src="https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/twitter.svg" width="40" height="40" alt="X.com (Twitter)"/>
    <p>X.com</p>
  </a>
</div>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>© 2025 khushveer007. All rights reserved.</p>
  <p>Made with ❤️ for virtual assistants and businesses everywhere</p>
</div>
