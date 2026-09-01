package com.marcel.music;

import android.content.Intent;
import android.media.MediaMetadata;
import android.media.session.MediaController;
import android.media.session.MediaSessionManager;
import android.media.session.PlaybackState;
import android.os.Build;
import android.util.Log;

public class DelegationService extends
        com.google.androidbrowserhelper.trusted.DelegationService {
    
    private static final String TAG = "MusicDelegationService";
    private MediaSessionManager.OnActiveSessionsChangedListener mediaSessionListener;
    
    @Override
    public void onCreate() {
        super.onCreate();
        setupMediaSessionListener();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        unregisterMediaSessionListener();
    }

    /**
     * Register a listener to monitor active MediaSessions from Chrome.
     * This enables integration with Android's media controls and Digital Wellbeing.
     */
    private void setupMediaSessionListener() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            return; // MediaSessionManager requires API 21+
        }

        try {
            MediaSessionManager mediaSessionManager =
                    (MediaSessionManager) getSystemService(android.content.Context.MEDIA_SESSION_SERVICE);
            
            if (mediaSessionManager == null) {
                Log.w(TAG, "MediaSessionManager not available");
                return;
            }

            mediaSessionListener = new MediaSessionManager.OnActiveSessionsChangedListener() {
                @Override
                public void onActiveSessionsChanged(java.util.List<MediaController> controllers) {
                    if (!controllers.isEmpty()) {
                        MediaController controller = controllers.get(0);
                        logMediaSessionInfo(controller);
                        // The system now knows this app is handling media playback
                    }
                }
            };

            // This requires MEDIA_CONTENT_CONTROL permission
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                // For Android 13+, permission is implicit in manifest
            }
            
            mediaSessionManager.addOnActiveSessionsChangedListener(
                    mediaSessionListener,
                    new Intent(Intent.ACTION_MEDIA_BUTTON)
            );
            
            Log.d(TAG, "MediaSession listener registered successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to setup MediaSession listener", e);
        }
    }

    /**
     * Log MediaSession information for debugging and system integration.
     */
    private void logMediaSessionInfo(MediaController controller) {
        try {
            PlaybackState state = controller.getPlaybackState();
            MediaMetadata metadata = controller.getMetadata();
            
            if (state != null) {
                Log.d(TAG, "MediaSession State: " + state.getState());
            }
            
            if (metadata != null) {
                String title = metadata.getString(MediaMetadata.METADATA_KEY_TITLE);
                String artist = metadata.getString(MediaMetadata.METADATA_KEY_ARTIST);
                Log.d(TAG, "Now Playing: " + title + " - " + artist);
            }
        } catch (Exception e) {
            Log.w(TAG, "Error retrieving MediaSession info", e);
        }
    }

    /**
     * Unregister the MediaSession listener when the service is destroyed.
     */
    private void unregisterMediaSessionListener() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            return;
        }

        try {
            MediaSessionManager mediaSessionManager =
                    (MediaSessionManager) getSystemService(android.content.Context.MEDIA_SESSION_SERVICE);
            
            if (mediaSessionManager != null && mediaSessionListener != null) {
                mediaSessionManager.removeOnActiveSessionsChangedListener(mediaSessionListener);
                Log.d(TAG, "MediaSession listener unregistered");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error unregistering MediaSession listener", e);
        }
    }
}

