import React, { useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useLocation } from "@/context/LocationContext";

interface Equipment {
  id: string;
  name: string;
  available: boolean;
  distance: string;
  imageUrl: string;
  price: string;
  latitude?: number;
  longitude?: number;
}

interface MachineryMapProps {
  equipment: Equipment[];
  onReserve: (equipmentId: string) => void;
  onMarkerPress: (machinery: Equipment) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

export default function MachineryMap({ equipment, onReserve, onMarkerPress, userLocation }: MachineryMapProps) {
  const webViewRef = useRef<WebView>(null);
  const { location } = useLocation();

  // Convert equipment data to map format
  const convertToMapData = (equipmentList: Equipment[]) => {
    return equipmentList.map((item, index) => ({
      id: parseInt(item.id),
      name: item.name,
      lat: item.latitude || (23.8103 + (index * 0.01)), // Default coordinates with slight offset
      lng: item.longitude || (90.4125 + (index * 0.01)),
      available: item.available,
      distance: item.distance,
      price: item.price
    }));
  };

  // Send location update to map
  useEffect(() => {
    if (location && webViewRef.current) {
      const message = JSON.stringify({
        type: 'UPDATE_LOCATION',
        location: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      });
      
      webViewRef.current.postMessage(message);
    }
  }, [location]);

  // Send equipment data update to map
  useEffect(() => {
    if (equipment.length > 0 && webViewRef.current) {
      const mapData = convertToMapData(equipment);
      const message = JSON.stringify({
        type: 'UPDATE_MACHINERY_DATA',
        machinery: mapData
      });
      
      webViewRef.current.postMessage(message);
    }
  }, [equipment]);

  // Send user location to map for centering
  useEffect(() => {
    if (userLocation && webViewRef.current) {
      const message = JSON.stringify({
        type: 'CENTER_ON_USER_LOCATION',
        location: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        }
      });
      webViewRef.current.postMessage(message);
    }
  }, [userLocation]);

  // Handle messages from WebView
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'RESERVE_MACHINERY' && data.machineryId) {
        // Find the equipment by ID and call onReserve
        const equipmentItem = equipment.find(item => parseInt(item.id) === data.machineryId);
        if (equipmentItem) {
          onReserve(equipmentItem.id);
        }
      } else if (data.type === 'SELECT_MACHINERY' && data.machinery) {
        onMarkerPress(data.machinery);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // HTML content for the WebView
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Leaflet Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
              integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
              crossorigin=""/>
        <style>
            body {
                margin: 0;
                padding: 0;
            }
            #map {
                height: 100vh;
                width: 100%;
            }
            .custom-marker {
                background-color: #2E7D32;
                border: 2px solid #fff;
                border-radius: 50%;
                width: 20px;
                height: 20px;
            }
            .available-marker {
                background-color: #4CAF50;
            }
            .unavailable-marker {
                background-color: #F44336;
            }
            .user-location-marker {
                background-color: #2196F3;
                border: 3px solid #fff;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
            }
            .user-location-pulse {
                background-color: rgba(33, 150, 243, 0.3);
                border-radius: 50%;
                width: 30px;
                height: 30px;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% {
                    transform: scale(0.8);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
                integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
                crossorigin=""></script>
        
        <script>
            // Initialize the map
            var map = L.map('map').setView([23.8103, 90.4125], 10);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(map);
            
            // Custom icons
            var availableIcon = L.divIcon({
                className: 'custom-marker available-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            var unavailableIcon = L.divIcon({
                className: 'custom-marker unavailable-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            var userLocationIcon = L.divIcon({
                className: 'user-location-marker',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            
            var markers = [];
            var userLocationMarker = null;
            
            // Function to clear all markers
            function clearMarkers() {
                markers.forEach(function(marker) {
                    map.removeLayer(marker);
                });
                markers = [];
            }

            // Function to update user location marker
            function updateUserLocation(location) {
                // Remove existing user location marker
                if (userLocationMarker) {
                    map.removeLayer(userLocationMarker);
                }
                
                // Add new user location marker
                userLocationMarker = L.marker([location.latitude, location.longitude], {
                    icon: userLocationIcon
                }).addTo(map);
                
                userLocationMarker.bindPopup('<div style="text-align: center;"><strong>Your Location</strong></div>');
                
                // Center map on user location
                map.setView([location.latitude, location.longitude], 14);
            }
            
            // Function to add markers
            function addMarkers(machineryData) {
                clearMarkers();
                
                machineryData.forEach(function(machinery) {
                    var icon = machinery.available ? availableIcon : unavailableIcon;
                    var marker = L.marker([machinery.lat, machinery.lng], {icon: icon}).addTo(map);
                    
                    var popupContent = '<div style="min-width: 200px;">' +
                        '<h3 style="margin: 0 0 10px 0; color: #2E7D32;">' + machinery.name + '</h3>' +
                        '<p style="margin: 5px 0;"><strong>Status:</strong> ' + (machinery.available ? 'Available' : 'Not Available') + '</p>' +
                        '<p style="margin: 5px 0;"><strong>Distance:</strong> ' + machinery.distance + '</p>' +
                        '<p style="margin: 5px 0;"><strong>Price:</strong> ' + machinery.price + '</p>' +
                        (machinery.available ? 
                            '<button onclick="reserveMachinery(' + machinery.id + ')" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Reserve</button>' : 
                            '<button disabled style="background: #ccc; color: #666; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px;">Not Available</button>') +
                        '</div>';
                    
                    marker.bindPopup(popupContent);
                    marker.on('click', function() {
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'SELECT_MACHINERY',
                                machinery: machinery
                            }));
                        }
                    });
                    markers.push(marker);
                });
                
                // Fit map to show all markers if no user location
                if (markers.length > 0 && !userLocationMarker) {
                    var group = new L.featureGroup(markers);
                    map.fitBounds(group.getBounds().pad(0.1));
                }
            }
            
            // Function to handle machinery reservation
            function reserveMachinery(id) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'RESERVE_MACHINERY',
                        machineryId: id
                    }));
                }
            }
            
            // Listen for messages from React Native
            window.addEventListener('message', function(event) {
                try {
                    var data = JSON.parse(event.data);
                    
                    if (data.type === 'UPDATE_LOCATION' && data.location) {
                        updateUserLocation(data.location);
                    }
                    
                    if (data.type === 'UPDATE_MACHINERY_DATA' && data.machinery) {
                        addMarkers(data.machinery);
                    }

                    if (data.type === 'CENTER_ON_USER_LOCATION' && data.location) {
                        updateUserLocation(data.location);
                    }
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            });
            
            // Initial sample data
            var sampleData = [
                {
                    id: 1,
                    name: "Tractor - John Deere 5050D",
                    lat: 23.8103,
                    lng: 90.4125,
                    available: true,
                    distance: "2.5 km",
                    price: "৳1,500/day"
                },
                {
                    id: 2,
                    name: "Harvester - Mahindra 575 DI",
                    lat: 23.8203,
                    lng: 90.4225,
                    available: true,
                    distance: "3.2 km",
                    price: "৳2,000/day"
                },
                {
                    id: 3,
                    name: "Plough - Disc Plough",
                    lat: 23.8003,
                    lng: 90.4025,
                    available: false,
                    distance: "1.8 km",
                    price: "৳800/day"
                }
            ];
            
            // Add initial markers
            addMarkers(sampleData);
        </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
