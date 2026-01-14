import { Link, router } from 'expo-router';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Formik } from 'formik';
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

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      await login(values.email, values.password);
      // Navigate to the main app after successful login
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'An error occurred during login');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginValidationSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry
                  textContentType="password"
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSubmit as any}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>

              <View style={styles.bottomContainer}>
                <Link href="../auth/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </Link>
                
                <Link href="../auth/signup" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Don&#39;t have an account? Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </>
          )}
        </Formik>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 5,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  linkText: {
    color: '#3498db',
    marginVertical: 5,
    fontSize: 16,
  },
});