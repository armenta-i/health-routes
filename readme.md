# Health Routes

A comprehensive healthcare navigation platform that connects patients in rural, tribal, and border communities to healthcare services that match their needs, language preferences, and location.

## Overview

Health Routes integrates AI-powered medical advice with real-time location services to provide personalized healthcare recommendations and navigation to nearby medical facilities. The platform supports multiple languages and provides culturally appropriate care options for underserved communities.

## Features

- **AI-Powered Medical Advice**: Integration with Google Gemini API for intelligent symptom analysis and medical recommendations
- **Location-Based Healthcare Search**: Automatic GPS detection to find nearby hospitals and medical facilities
- **Multi-Language Support**: Healthcare advice and navigation in multiple languages
- **Real-Time Navigation**: Turn-by-turn directions with live location tracking
- **Emergency Detection**: Automatic identification of urgent medical situations with appropriate warnings
- **Cross-Platform Mobile App**: Built with React Native for iOS and Android compatibility

## Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **React Navigation** - Navigation library for screen transitions
- **Expo Location** - GPS and location services
- **React Native Maps** - Interactive mapping and navigation
- **AsyncStorage** - Local data persistence

### Backend
- **FastAPI** - Modern Python web framework
- **Python 3.10+** - Core backend language
- **Google Maps APIs** - Places, Geocoding, and Directions services
- **Google Gemini API** - AI-powered medical advice generation
- **Uvicorn** - ASGI server for production deployment

## Project Structure

```
health-routes/
├── backend/
│   ├── main.py                     # FastAPI application entry point
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example               # Environment variables template
│   └── app/
│       ├── core/
│       │   └── google_routes.py   # Google APIs integration
│       └── services/
│           └── gemini.py          # AI medical advice service
├── frontend/
│   ├── App.js                     # React Native app entry point
│   ├── package.json               # Node.js dependencies
│   ├── .env.example              # Environment variables template
│   ├── components/
│   │   └── Button.js             # Reusable UI components
│   ├── context/
│   │   └── AuthContext.js        # Authentication state management
│   ├── screens/
│   │   ├── landingPage.js        # Home/welcome screen
│   │   ├── MedicalForm.js        # Symptom input form
│   │   ├── resultsScreen.js      # Medical advice display
│   │   └── MapComponent.js       # Navigation and mapping
│   └── config.js                 # App configuration
└── README.md
```

## Prerequisites

- **Node.js** v16 or higher
- **Python** 3.10 or higher
- **Expo CLI** (`npm install -g expo-cli`)
- **Git** version control
- **Google Cloud Platform** account with enabled APIs
- **Mobile device** or emulator for testing

## Installation and Setup

### Backend Configuration

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment:**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   # Google APIs Configuration
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
   
   # Server Configuration
   HOST=0.0.0.0
   PORT=8000
   DEBUG=True
   ```

5. **Start the FastAPI development server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   API documentation: `http://localhost:8000/docs`

### Frontend Configuration

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file:
   ```env
   API_BASE_URL=http://localhost:8000
   ```

4. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

5. **Run on device:**
   - Install Expo Go app on your mobile device
   - Scan the QR code displayed in the terminal
   - Or press `a` for Android emulator, `i` for iOS simulator

## API Configuration

### Required Google Cloud APIs

Enable the following APIs in your Google Cloud Console:

1. **Google Maps JavaScript API**
2. **Google Places API**
3. **Google Geocoding API**
4. **Google Directions API**
5. **Google Gemini API** (for AI medical advice)

### API Key Configuration

1. Create API keys in Google Cloud Console
2. Configure API key restrictions for security:
   - HTTP referrers for web usage
   - Android/iOS app restrictions for mobile
3. Set appropriate quotas and billing limits

## Usage

### Patient Workflow

1. **Landing Page**: Users are welcomed and can access the care finder
2. **Location Detection**: App automatically detects user's GPS location
3. **Medical Form**: Users input their symptoms and language preference
4. **AI Analysis**: Google Gemini processes symptoms and provides medical advice
5. **Results Display**: 
   - Medical recommendations with emergency warnings highlighted
   - Nearest hospital information with contact details
6. **Navigation**: Interactive map with turn-by-turn directions to the hospital

### Key Features

- **Automatic Location Detection**: Uses device GPS for accurate positioning
- **Smart Emergency Detection**: AI identifies urgent symptoms and displays warnings
- **Distance Units**: Imperial system (miles/feet) for US-based users
- **Country-Specific Results**: Healthcare facilities filtered by user's country
- **Multilingual Support**: Medical advice in user's preferred language

## Development

### Code Style

- **Frontend**: JavaScript/React Native with functional components
- **Backend**: Python with type hints and async/await patterns
- **Consistent Styling**: Black theme with professional UI components

### Key Components

- **Button Component**: Reusable UI element with multiple variants
- **Location Services**: GPS tracking with fallback mechanisms
- **API Integration**: Robust error handling and response processing
- **Medical Text Parsing**: Smart formatting for AI-generated advice

## Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment
- Deploy to cloud platforms (AWS, Google Cloud, Heroku)
- Configure environment variables for production
- Set up SSL certificates for HTTPS
- Configure CORS for frontend domain

### Frontend Deployment
- Build for production: `expo build:android` or `expo build:ios`
- Deploy to app stores (Google Play Store, Apple App Store)
- Configure production API endpoints

## Contributing

We welcome contributions to Health Routes! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow code style** conventions used in the project
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Submit a pull request** with a clear description of changes

### Development Guidelines

- Use meaningful commit messages
- Maintain backward compatibility
- Test on multiple devices and screen sizes
- Follow accessibility best practices
- Ensure HIPAA compliance considerations

## Security Considerations

- **API Key Security**: Never commit API keys to version control
- **Data Privacy**: Minimal health data collection and processing
- **Location Privacy**: GPS data used only for immediate navigation
- **Secure Communication**: HTTPS for all API communications

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

For support, feature requests, or bug reports:

1. **GitHub Issues**: Create an issue in this repository
2. **Documentation**: Check the `/docs` folder for detailed guides
3. **Community**: Join our discussions for community support

## Acknowledgments

- **Google Cloud Platform** for AI and mapping services
- **Expo Team** for React Native development tools
- **Open Source Community** for the foundational libraries and frameworks

---

**Health Routes** - Connecting communities to healthcare, one route at a time.