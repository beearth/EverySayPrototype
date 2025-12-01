import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import VerticalVideoModal from '../components/VerticalVideoModal';

// Example video sources - replace with your actual video URIs
const EXAMPLE_VIDEOS = [
  {
    id: '1',
    title: 'Sample Video 1',
    source: { uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  },
  {
    id: '2',
    title: 'Sample Video 2',
    source: { uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
  },
  // For local videos, use require() instead:
  // { id: '3', title: 'Local Video', source: require('../assets/videos/local-video.mp4') },
];

export default function ExampleScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<{
    source: { uri: string } | number;
    title: string;
  } | null>(null);

  const openVideo = (video: typeof EXAMPLE_VIDEOS[0]) => {
    setCurrentVideo({ source: video.source, title: video.title });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    // Optional: Clear video after a short delay to allow smooth close animation
    setTimeout(() => {
      setCurrentVideo(null);
    }, 300);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Vertical Video Modal Example</Text>
        <Text style={styles.description}>
          Tap a video below to open it in a vertical 9:16 modal, similar to YouTube Shorts or TikTok.
        </Text>

        <View style={styles.videoList}>
          {EXAMPLE_VIDEOS.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.videoButton}
              onPress={() => openVideo(video)}
            >
              <Text style={styles.videoButtonText}>{video.title}</Text>
              <Text style={styles.videoButtonSubtext}>Tap to open</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Usage Notes:</Text>
          <Text style={styles.infoText}>
            • The video container enforces a 9:16 aspect ratio{'\n'}
            • Videos use resizeMode="cover" to fill the container{'\n'}
            • 16:9 videos will be cropped on the sides{'\n'}
            • Modal has a dark backdrop and rounded corners{'\n'}
            • Tap outside the modal or the close button to dismiss
          </Text>
        </View>
      </ScrollView>

      {/* Vertical Video Modal */}
      <VerticalVideoModal
        visible={modalVisible}
        onClose={closeModal}
        source={currentVideo?.source || { uri: '' }}
        title={currentVideo?.title || 'Video'}
        footer={
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => Alert.alert('Action', 'Footer action pressed')}
            >
              <Text style={styles.footerButtonText}>Action</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  videoList: {
    gap: 12,
    marginBottom: 24,
  },
  videoButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  videoButtonSubtext: {
    fontSize: 12,
    color: '#999',
  },
  infoBox: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  footerButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

