import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Calculate 9:16 aspect ratio dimensions
const getVerticalVideoDimensions = () => {
  const maxWidth = Math.min(SCREEN_WIDTH * 0.9, 400); // Max 400px or 90% of screen
  const calculatedHeight = (maxWidth * 16) / 9; // 9:16 aspect ratio
  const maxHeight = SCREEN_HEIGHT * 0.85; // Max 85% of screen height
  const videoHeight = Math.min(calculatedHeight, maxHeight);
  // If height is constrained, adjust width to maintain 9:16 ratio
  const finalWidth = videoHeight < calculatedHeight ? (videoHeight * 9) / 16 : maxWidth;
  return {
    width: finalWidth,
    height: videoHeight,
  };
};

interface VerticalVideoModalProps {
  visible: boolean;
  onClose: () => void;
  source: { uri: string } | number;
  title?: string;
  footer?: React.ReactNode;
}

export default function VerticalVideoModal({
  visible,
  onClose,
  source,
  title = 'Video',
  footer,
}: VerticalVideoModalProps) {
  const videoRef = React.useRef<VideoRef>(null);
  const { width: videoWidth, height: videoHeight } = getVerticalVideoDimensions();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.container}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.modalCard, { width: videoWidth }]}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Video Container - 9:16 aspect ratio */}
                <View style={[styles.videoContainer, { width: videoWidth, height: videoHeight }]}>
                  <Video
                    ref={videoRef}
                    source={source}
                    style={styles.video}
                    resizeMode="cover"
                    controls
                    paused={!visible}
                    repeat
                    playInBackground={false}
                    playWhenInactive={false}
                  />
                </View>

                {/* Footer */}
                {footer && <View style={styles.footer}>{footer}</View>}
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  videoContainer: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    // 9:16 aspect ratio is enforced by calculated dimensions
  },
  video: {
    width: '100%',
    height: '100%',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

