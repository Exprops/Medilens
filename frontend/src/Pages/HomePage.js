import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as mediscanApi from '../api/mediscanApi';

import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast'; 

import { Upload, X, AlertCircle, MapPin } from 'lucide-react';


if (window.L) {
    delete window.L.Icon.Default.prototype._getIconUrl;
    window.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}


function HomePage() {
    const [userPrompt, setUserPrompt] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [geminiReply, setGeminiReply] = useState('Type a message or upload an image for AI analysis!');
    const [error, setError] = useState(null);

    
    const mapRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [mapError, setMapError] = useState(null);
    const [isMapLoading, setIsMapLoading] = useState(false);
    const [hospitalsList, setHospitalsList] = useState([]); 

    const { toast } = useToast();

    
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const uploadMutation = useMutation({
        mutationFn: ({ imageFile, textPrompt }) => mediscanApi.uploadImageForAnalysis(imageFile, textPrompt),
        onMutate: () => {
            setError(null);
            setGeminiReply('Analyzing... please wait.');
        },
        onSuccess: (data) => {
            setGeminiReply(data.gemini_response || data.gemini_reply);
            setUserPrompt('');
            setSelectedImage(null);
            setImagePreviewUrl('');
            toast({
                title: "Analysis Complete!",
                description: "AI has provided insights for your image.",
                variant: "success",
            });
        },
        onError: (err) => {
            setError(err.message || "Failed to get AI response. Please try again.");
            setGeminiReply('Error communicating with AI.');
            toast({
                title: "Analysis Failed",
                description: err.message || "There was an error processing your request.",
                variant: "destructive",
            });
        },
    });

    const chatMutation = useMutation({
        mutationFn: (prompt) => mediscanApi.chatWithGemini(prompt),
        onMutate: () => {
            setError(null);
            setGeminiReply('Thinking...');
        },
        onSuccess: (data) => {
            setGeminiReply(data.gemini_reply);
            setUserPrompt('');
            toast({
                title: "Chat Response",
                description: "Gemini has replied to your message.",
                variant: "success",
            });
        },
        onError: (err) => {
            setError(err.message || "Failed to get Gemini's reply. Please try again.");
            setGeminiReply('Error communicating with Gemini.');
            toast({
                title: "Chat Failed",
                description: err.message || "There was an error processing your chat.",
                variant: "destructive",
            });
        },
    });

    const isLoading = uploadMutation.isPending || chatMutation.isPending;

    const handlePromptChange = (event) => {
        setUserPrompt(event.target.value);
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError("Image file size exceeds 10MB. Please choose a smaller image.");
                setSelectedImage(null);
                setImagePreviewUrl('');
                toast({
                    title: "File Too Large",
                    description: "Please choose an image under 10MB.",
                    variant: "destructive",
                });
                return;
            }
            setSelectedImage(file);
            setImagePreviewUrl(URL.createObjectURL(file));
            setError(null);
        } else {
            setSelectedImage(null);
            setImagePreviewUrl('');
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreviewUrl('');
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.value = null;
        }
    };

    const handleUpload = () => {
        const hasImage = selectedImage !== null;
        const hasText = userPrompt.trim() !== '';

        if (!hasText && !hasImage) {
            setError("Please enter a message or select an image to analyze.");
            toast({
                title: "Input Required",
                description: "Please provide text or an image.",
                variant: "warning",
            });
            return;
        }

        if (hasImage) {
            uploadMutation.mutate({ imageFile: selectedImage, textPrompt: userPrompt });
        } else {
            chatMutation.mutate(userPrompt);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !isLoading) {
            handleUpload();
        }
    };

    const getUserGeolocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser."));
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        });
                    },
                    (error) => {
                        let errorMessage = "Unable to retrieve your location.";
                        switch (error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessage = "Location permission denied. Please enable it in your browser settings.";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessage = "Location information is unavailable.";
                                break;
                            case error.TIMEOUT:
                                errorMessage = "The request to get user location timed out.";
                                break;
                            default:
                                break;
                        }
                        reject(new Error(errorMessage));
                    }
                );
            }
        });
    };

    const initLeafletMapAndFindHospitals = async () => {
        setIsMapLoading(true);
        setMapError(null);
        setHospitalsList([]);

        try {
            const location = await getUserGeolocation();

            let map = mapInstance;
            if (!map) {
                
                if (!window.L) {
                    throw new Error("Leaflet.js library not loaded. Check public/index.html.");
                }
                map = window.L.map(mapRef.current).setView([location.lat, location.lng], 13);
                setMapInstance(map);

               
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
            } else {
                
                map.setView([location.lat, location.lng], 13);
                
                map.eachLayer((layer) => {
                    if (layer instanceof window.L.Marker) {
                        map.removeLayer(layer);
                    }
                });
            }

            
            window.L.marker([location.lat, location.lng]).addTo(map)
                .bindPopup('Your Location').openPopup();

            
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/leaflet-hospitals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: location.lat, longitude: location.lng, radius_km: 5 }) // Request 5km radius
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch hospitals from backend.');
            }

            const data = await response.json();
            const fetchedHospitals = data.hospitals;

            if (fetchedHospitals && fetchedHospitals.length > 0) {
                fetchedHospitals.forEach(hospital => {
                    
                    window.L.marker([hospital.latitude, hospital.longitude]).addTo(map)
                        .bindPopup(`<b>${hospital.name}</b><br>${hospital.address}<br>${hospital.distance_km} km`);
                });
                setHospitalsList(fetchedHospitals); // Set all fetched hospitals to state
                toast({
                    title: "Hospitals Found!",
                    description: `Found ${fetchedHospitals.length} nearby medical facilities.`,
                    variant: "success",
                });
            } else {
                setHospitalsList([]);
                toast({
                    title: "No Hospitals Found",
                    description: "Could not find any medical facilities nearby.",
                    variant: "info",
                });
            }

        } catch (err) {
            setMapError(err.message);
            toast({
                title: "Location/Map Error",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsMapLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (mapInstance && typeof mapInstance.remove === 'function') {
                mapInstance.remove();
                setMapInstance(null); 
            }
        };
    }, [mapInstance]); 
    return (
        <div className="app-container">
            <div className="main-content-card">
                <h1 className="main-title">
                    MediLens AI Assistant 👁️‍🗨️
                </h1>
                <p className="subtitle">
                    Upload an image of a condition and/or describe it for AI insights and first aid suggestions.
                </p>

                {/* Error message display */}
                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                {/* Image Input Section */}
                <div className="image-input-section">
                    <label htmlFor="file-input" className="image-input-label">
                        Upload Image (Optional):
                    </label>
                    <div
                        className="upload-area"
                        onClick={() => document.getElementById('file-input')?.click()}
                    >
                        <Upload className="upload-icon" />
                        <p className="upload-text-main">Drag & drop or click to browse</p>
                        <p className="upload-text-sub">(PNG, JPG, GIF, WEBP up to 10MB)</p>
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="file-input-hidden"
                            disabled={isLoading}
                        />
                    </div>
                    {imagePreviewUrl && (
                        <div className="image-preview-container">
                            <h3 className="image-preview-title">Uploaded Image Preview:</h3>
                            <div className="relative">
                                <img
                                    src={imagePreviewUrl}
                                    alt="Skin condition preview"
                                    className="uploaded-image"
                                />
                                <button
                                    onClick={removeImage}
                                    className="remove-image-button"
                                    aria-label="Remove image"
                                >
                                    <X className="remove-icon" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Response Display Area */}
                <div className="ai-response-area">
                    {isLoading ? (
                        <div className="loading-spinner-container">
                            <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="loading-text">{uploadMutation.isPending ? "Analyzing Image..." : "Thinking..."}</p>
                        </div>
                    ) : (
                        <p className="gemini-reply-text" dangerouslySetInnerHTML={{ __html: geminiReply.replace(/\n/g, '<br>') }}></p>
                    )}
                </div>

                {/* User Input Field and Send Button */}
                <div className="input-button-group">
                    <input
                        type="text"
                        className="user-input-field"
                        placeholder="Describe the condition or ask a question..."
                        value={userPrompt}
                        onChange={handlePromptChange}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleUpload}
                        disabled={isLoading}
                        className="custom-button"
                    >
                        {isLoading ? (
                            <>
                                <svg className="button-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            "Analyze"
                        )}
                    </Button>
                </div>

                {/* Disclaimer - IMPORTANT for health-related AI */}
                <div className="disclaimer-box">
                    <p className="disclaimer-title">
                        <AlertCircle className="disclaimer-icon" />
                        Disclaimer:
                    </p>
                    <p>
                        This information is for general knowledge only and is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for any health concerns.
                    </p>
                </div>

                {/* --- Leaflet Map Section --- */}
                <div className="map-section">
                    <h2 className="map-title">
                        <MapPin className="map-pin-icon" /> Find Nearby Hospitals
                    </h2>
                    <Button
                        onClick={initLeafletMapAndFindHospitals}
                        disabled={isMapLoading}
                        className="custom-button map-button"
                    >
                        {isMapLoading ? (
                            <>
                                <svg className="button-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Locating...
                            </>
                        ) : (
                            "Locate Nearby Hospitals"
                        )}
                    </Button>
                    {mapError && (
                        <div className="error-message map-error-message" role="alert">
                            {mapError}
                        </div>
                    )}
                    {/* The div where Leaflet will render the map */}
                    <div id="leaflet-map" ref={mapRef} className="leaflet-map-container" aria-label="Map showing nearby hospitals">
                        {/* Map will be rendered here by Leaflet */}
                    </div>

                    {/* Hospital List Display */}
                    {hospitalsList.length > 0 && (
                        <div className="hospital-list-container">
                            <h3 className="hospital-list-title">Nearby Medical Facilities:</h3>
                            <ul className="hospital-list">
                                {hospitalsList.map((hospital, index) => (
                                    // Using osm_id as key for uniqueness, fallback to index
                                    <li key={hospital.osm_id || index} className="hospital-list-item">
                                        <strong>{hospital.name}</strong><br />
                                        {/* {hospital.address}<br /> */}
                                        {[
                                            hospital.address?.road,
                                            hospital.address?.suburb || hospital.address?.city,
                                            hospital.address?.state,
                                            hospital.address?.postcode,
                                        ].filter(Boolean).join(', ')}

                                        Location: ({hospital.latitude?.toFixed(4)}, {hospital.longitude?.toFixed(4)})<br />
                                        
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on Map
                                        </a><br />
                                        Distance: {hospital.distance_km} km
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HomePage;
