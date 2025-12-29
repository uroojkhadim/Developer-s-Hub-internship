import { Link, router } from 'expo-router';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

// Forgot password validation schema
const forgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

export default function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();

  const handleForgotPassword = async (values: { email: string }) => {
    try {
      await forgotPassword(values.email);
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred while sending reset email');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter your email to reset your password</Text>

        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordValidationSchema}
          onSubmit={handleForgotPassword}
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

              <TouchableOpacity 
                style={styles.button} 
                onPress={handleSubmit as any}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>

              <View style={styles.bottomContainer}>
                <Link href="../auth/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Back to Login</Text>
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
    backgroundColor: '#f39c12',
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