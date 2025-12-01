import React, { useState, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Pdf from 'react-native-pdf';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [pdfUri, setPdfUri] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1.0);
  const pdfRef = useRef(null);

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsLoading(true);
        setPdfUri(result.assets[0].uri);
        setCurrentPage(1);
        setScale(1.0);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open document');
      console.error(err);
    }
  }, []);

  const handleLoadComplete = useCallback((numberOfPages) => {
    setTotalPages(numberOfPages);
    setIsLoading(false);
  }, []);

  const handlePageChanged = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleError = useCallback((error) => {
    setIsLoading(false);
    Alert.alert('Error', 'Failed to load PDF');
    console.error(error);
  }, []);

  const goToPrevPage = useCallback(() => {
    if (pdfRef.current && currentPage > 1) {
      pdfRef.current.setPage(currentPage - 1);
    }
  }, [currentPage]);

  const goToNextPage = useCallback(() => {
    if (pdfRef.current && currentPage < totalPages) {
      pdfRef.current.setPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const closeDocument = useCallback(() => {
    setPdfUri(null);
    setCurrentPage(1);
    setTotalPages(0);
    setScale(1.0);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appTitle}>Okular</Text>
          <Text style={styles.appSubtitle}>Mobile</Text>
        </View>
        {pdfUri ? (
          <TouchableOpacity style={styles.closeButton} onPress={closeDocument}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Main Content */}
      {!pdfUri ? (
        <View style={styles.welcomeContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.welcomeIcon}>📄</Text>
          </View>
          <Text style={styles.welcomeTitle}>Welcome to Okular Mobile</Text>
          <Text style={styles.welcomeSubtitle}>
            A universal document viewer for your device
          </Text>

          <TouchableOpacity style={styles.openButton} onPress={pickDocument}>
            <Text style={styles.openButtonText}>Open PDF Document</Text>
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureTitle}>Native Experience</Text>
              <Text style={styles.featureDescription}>
                Smooth scrolling and pinch to zoom
              </Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureTitle}>Privacy First</Text>
              <Text style={styles.featureDescription}>
                Documents stay on your device
              </Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>⚡</Text>
              <Text style={styles.featureTitle}>Fast & Light</Text>
              <Text style={styles.featureDescription}>
                Quick loading, low memory usage
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.pdfContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Loading document...</Text>
            </View>
          )}
          
          <Pdf
            ref={pdfRef}
            trustAllCerts={false}
            source={{ uri: pdfUri }}
            onLoadComplete={handleLoadComplete}
            onPageChanged={handlePageChanged}
            onError={handleError}
            scale={scale}
            minScale={0.5}
            maxScale={3.0}
            style={styles.pdf}
            enablePaging={true}
            horizontal={false}
          />

          {/* Toolbar */}
          <View style={styles.toolbar}>
            <View style={styles.toolbarGroup}>
              <TouchableOpacity
                style={[styles.toolbarButton, currentPage <= 1 && styles.toolbarButtonDisabled]}
                onPress={goToPrevPage}
                disabled={currentPage <= 1}
              >
                <Text style={styles.toolbarButtonText}>◀</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                {currentPage} / {totalPages}
              </Text>
              <TouchableOpacity
                style={[styles.toolbarButton, currentPage >= totalPages && styles.toolbarButtonDisabled]}
                onPress={goToNextPage}
                disabled={currentPage >= totalPages}
              >
                <Text style={styles.toolbarButtonText}>▶</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toolbarGroup}>
              <TouchableOpacity
                style={[styles.toolbarButton, scale <= 0.5 && styles.toolbarButtonDisabled]}
                onPress={zoomOut}
                disabled={scale <= 0.5}
              >
                <Text style={styles.toolbarButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.zoomInfo}>{Math.round(scale * 100)}%</Text>
              <TouchableOpacity
                style={[styles.toolbarButton, scale >= 3.0 && styles.toolbarButtonDisabled]}
                onPress={zoomIn}
                disabled={scale >= 3.0}
              >
                <Text style={styles.toolbarButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Based on KDE Okular • Document Viewer
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#667eea',
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 8,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  welcomeIcon: {
    fontSize: 60,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 30,
  },
  openButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 40,
  },
  openButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresContainer: {
    width: '100%',
  },
  feature: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#16213e',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 15,
    fontSize: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarButtonDisabled: {
    opacity: 0.4,
  },
  toolbarButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  pageInfo: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginHorizontal: 15,
    minWidth: 60,
    textAlign: 'center',
  },
  zoomInfo: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginHorizontal: 10,
    minWidth: 50,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
});
