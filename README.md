# CourseSync-Agent

An intelligent academic course management Web Application powered by Groq LLM for syllabus parsing, workload analysis, and smart scheduling.

## Problem Statement

The academic course management landscape faces several critical challenges:

1. **Manual Syllabus Processing**: Time-consuming manual extraction of assignment information from syllabus
2. **Workload Management**: Difficulty in balancing assignments and study time across multiple courses
3. **Deadline Tracking**: Challenge in managing multiple deadlines and prioritizing tasks effectively
4. **Study Planning**: Lack of optimized study schedules that account for workload distribution
5. **Proactive Notifications**: Missing timely reminders and strategic study recommendations

CourseSync-Agent addresses these challenges through an intelligent multi-agent system that automates course data synchronization, validation, and management via a beautiful, modern web interface.

## System Architecture
![System Architecture Diagram](diagram.png)

## System Design & Reasoning Flow

### Core Components

1. **CourseSyncAgent**
   - Syllabus Parser: Extracts structured data from course syllabi
   - Workload Analyzer: Identifies workload distribution and risk periods
   - Schedule Optimizer: Creates personalized study schedules
   - Notification Generator: Provides strategic alerts and reminders

2. **Technology Stack**
   - **Language Models**:
     - Groq LLM (llama-3.3-70b-versatile) for intelligent processing
   
   - **External Services**:
     - Firecrawl API for web page scraping
     - SMTP (configurable via environment) for email notifications
   
   - **Web Framework**:
     - FastAPI for robust backend API
     - Modern responsive web UI with beautiful design
     - Real-time updates and interactive visualizations
     - Smooth animations and engaging user experience

3. **Data Structures**
   - Course information (name, code, instructor)
   - Assignments (name, type, due date, weight, hours)
   - Workload analysis (weekly breakdown, risk periods)
   - Study schedule (daily tasks, priorities)
   - Smart notifications (deadlines, reminders, warnings)

### Data Flow

1. **Input Sources**:
   - Manual syllabus text entry via web interface
   - PDF file upload
   - Web page scraping via Firecrawl
   - Configuration via environment variables
   - User preferences (study hours, semester dates) through settings

2. **Processing Pipeline**:
   - Syllabus parsing with structured JSON output
   - Workload analysis with risk identification
   - Schedule optimization with task breakdown
   - Smart notification generation

3. **Output Generation**:
   - Beautiful web dashboard with real-time statistics
   - Interactive course and assignment management
   - Visual workload analysis with charts
   - Personalized study schedules
   - Smart notification panel
   - Calendar export (.ics format)
   - Email notifications (optional) with background scheduler

## Features

- 🎓 **Course Management**: Add courses via text, PDF, or URL scraping
- 📋 **Assignment Tracking**: Track progress with visual progress bars
- 📊 **Workload Analysis**: Visual breakdown of weekly hours and risk periods
- 📅 **Smart Scheduling**: AI-generated personalized study schedules
- 🔔 **Smart Notifications**: Strategic reminders and deadline alerts
- 📆 **Calendar Export**: Export assignments to .ics format
- ⚙️ **Customizable Settings**: Configure study hours, risk thresholds, and notifications
- 📱 **Responsive Design**: Works beautifully on desktop, tablet, and mobile

## Limitations and Future Work

### Current Limitations

1. **Input Constraints**
   - Manual syllabus text entry required
   - Limited web scraping capabilities
   - Fixed study hour estimations

2. **Technical Constraints**
   - Groq API dependency
   - No offline mode support
   - Basic error handling

3. **Feature Limitations**
   - No collaborative features
   - Static notification rules
   - Limited customization options

### Future Work

1. **Enhanced Capabilities**
   - Calendar integration via APIs (Google Calendar)
   - Dynamic study hour estimation
   - Advanced analytics and insights
   - Mobile companion app

2. **Technical Improvements**
   - Multi-LLM provider support
   - Offline mode operation
   - Enhanced error handling
   - Real-time collaboration

3. **Feature Expansions**
   - Collaborative study groups
   - Custom notification rules
   - Learning style adaptation
   - Integration with learning management systems

## Getting Started

### Prerequisites

- Python 3.7+
- pip package manager
- Groq API key
- (Optional) Firecrawl API key for web scraping

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AsmSafone/CourseSync-Agent.git
   cd CourseSync-Agent
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv coursesync-env
   .\coursesync-env\Scripts\activate

   # Linux/Mac
   python -m venv coursesync-env
   source coursesync-env/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configuration**
   
   Create a `.env` file in the project root:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   FIRECRAWL_API_KEY=your_firecrawl_api_key_here  # Optional
   
   # SMTP settings for email notifications (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_app_password
   ```

### Running the Application

Start the web server:
```bash
python main.py
```

Or run directly:
```bash
python webui.py
```

Then open your browser and navigate to:
```
http://localhost:8000
```

### Data Persistence

- The application creates a local `data/` folder automatically
- Settings are stored in `data/settings.json`
- Current state (courses and assignments) is stored in `data/data.json` and updated automatically
- Calendar exports default to `data/coursesync_calendar.ics`

## Usage Guide

### Adding Courses

1. Navigate to the **Courses** page
2. Click **Add Course** button
3. Choose your input method:
   - **Text**: Paste syllabus content directly
   - **URL**: Provide a course webpage URL for automatic scraping
   - **PDF**: Upload a PDF file containing the syllabus
4. Enter the semester start date
5. The AI will automatically parse and extract all assignments

### Managing Assignments

- View all assignments on the **Assignments** page
- Filter by: All, Upcoming, Completed, or In Progress
- Update progress using the progress bar or input field
- Track due dates and estimated hours

### Analyzing Workload

1. Go to the **Workload** page
2. Click **Analyze** to generate workload analysis
3. View:
   - Total study hours
   - Weekly breakdown with visual charts
   - Risk periods identification
   - Personalized recommendations

### Generating Study Schedule

1. Navigate to the **Schedule** page
2. Set your preferred study hours per day
3. Click **Generate** to create a personalized schedule
4. View daily tasks with priorities and time allocations
5. Review warnings and recommendations

### Smart Notifications

- Visit the **Notifications** page
- Click **Refresh** to generate smart notifications
- View strategic reminders, deadline alerts, and study recommendations
- Enable email notifications in Settings for automatic delivery

### Settings

Configure your preferences:
- **Study Preferences**: Daily hours, risk threshold, notification lead days
- **Email Notifications**: Enable/disable, set recipient email, configure scheduler
- **Export**: Download calendar file (.ics format)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
