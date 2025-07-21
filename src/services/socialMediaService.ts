import { Linking, Alert } from 'react-native';

const SOCIAL_MEDIA_URLS = {
  tiktok: 'https://www.tiktok.com/@rodrigojavierpint7?_t=ZM-8y5ljF8yvhu&_r=1',
  instagram: 'https://www.instagram.com/amber_infusion/',
};

export const socialMediaService = {
  async openTikTok(): Promise<void> {
    try {
      console.log('🎵 Opening TikTok...');
      
      // Intentar abrir la app de TikTok primero
      const tiktokAppUrl = 'tiktok://user?username=rodrigojavierpint7';
      const canOpenApp = await Linking.canOpenURL(tiktokAppUrl);
      
      if (canOpenApp) {
        await Linking.openURL(tiktokAppUrl);
      } else {
        // Si la app no está disponible, abrir en navegador
        await Linking.openURL(SOCIAL_MEDIA_URLS.tiktok);
      }
    } catch (error) {
      console.error('❌ Error opening TikTok:', error);
      Alert.alert('Error', 'No se pudo abrir TikTok');
    }
  },

  async openInstagram(): Promise<void> {
    try {
      console.log('📸 Opening Instagram...');
      
      // Intentar abrir la app de Instagram primero
      const instagramAppUrl = 'instagram://user?username=amber_infusion';
      const canOpenApp = await Linking.canOpenURL(instagramAppUrl);
      
      if (canOpenApp) {
        await Linking.openURL(instagramAppUrl);
      } else {
        // Si la app no está disponible, abrir en navegador
        await Linking.openURL(SOCIAL_MEDIA_URLS.instagram);
      }
    } catch (error) {
      console.error('❌ Error opening Instagram:', error);
      Alert.alert('Error', 'No se pudo abrir Instagram');
    }
  },

  async openSocialMedia(platform: 'tiktok' | 'instagram'): Promise<void> {
    if (platform === 'tiktok') {
      await this.openTikTok();
    } else if (platform === 'instagram') {
      await this.openInstagram();
    }
  }
};
