import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

// Login validation schema
const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function LoginScreen() {
  const { login } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'An error occurred during login');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.topBar}>
          <View style={styles.logoMark}>
            <View style={styles.logoDot} />
            <View style={styles.logoDot} />
            <View style={styles.logoDot} />
            <View style={styles.logoDot} />
          </View>
          <Text style={styles.brand}>Social Connect</Text>
        </View>

        <View style={styles.hero}>
          <Image
            source={require('../../assets/images/partial-react-logo.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.pillBadge}>
            <Text style={styles.pillBadgeText}>PREMIUM NETWORK</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>
            Network. Share. <Text style={styles.headingAccent}>Evolve.</Text>
          </Text>
          <Text style={styles.subheading}>
            Welcome back to your professional creative hub.
          </Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginValidationSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="name@example.com"
                      placeholderTextColor="#A0A8B5"
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      value={values.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      textContentType="emailAddress"
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#A0A8B5"
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      secureTextEntry={!isPasswordVisible}
                      textContentType="password"
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setIsPasswordVisible(prev => !prev)}
                    >
                      <Text style={styles.eyeText}>{isPasswordVisible ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.rowBetween}>
                  <View />
                  <Link href="../auth/forgot-password" asChild>
                    <TouchableOpacity>
                      <Text style={styles.link}>Forgot password?</Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSubmit as any}
                  disabled={isSubmitting}
                >
                  <Text style={styles.primaryButtonText}>
                    {isSubmitting ? 'Signing in...' : 'Sign In  →'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.separatorRow}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>Or continue with</Text>
                  <View style={styles.separatorLine} />
                </View>

                <View style={styles.socialRow}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialText}>Aa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialText}>◎</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>Don&apos;t have an account?</Text>
                  <Link href="../auth/signup" asChild>
                    <TouchableOpacity>
                      <Text style={styles.footerLink}> Create Account</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  logoMark: {
    position: 'absolute',
    left: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 26,
    height: 26,
    justifyContent: 'space-between',
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#0EA5E9',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  heroImage: {
    width: '100%',
    height: 260,
    borderRadius: 28,
  },
  brand: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  pillBadge: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    backgroundColor: '#FFD54F',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  headingAccent: {
    color: '#0EA5E9',
  },
  subheading: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  eyeButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  eyeText: {
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  link: {
    color: '#0EA5E9',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: '#9CA3AF',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
  },
  socialText: {
    fontSize: 20,
    color: '#111827',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 13,
    color: '#0EA5E9',
    fontWeight: '700',
  },
});