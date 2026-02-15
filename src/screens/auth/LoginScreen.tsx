import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { Button, Input, Card } from '../../components';
import { loginSchema } from '../../utils/validationSchemas';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import theme from '../../theme';
import type { RootState, AppDispatch } from '../../store';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';

type LoginScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, 'Login'>,
  StackNavigationProp<RootStackParamList>
>;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const initialValues: LoginFormValues = {
    email: '',
    password: '',
  };

  const handleLogin = async (values: LoginFormValues) => {
    dispatch(loginStart());
    try {
      const user = await authService.login(values);
      dispatch(loginSuccess(user));
      // Navigation handled by AppNavigator based on auth state
    } catch (errorObj: any) {
      dispatch(loginFailure(errorObj.message));
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            <Formik
              initialValues={initialValues}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleSubmit, values, errors, touched }) => (
                <>
                  <Input
                    label="Email"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    error={touched.email && errors.email ? errors.email : undefined}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Input
                    label="Password"
                    value={values.password}
                    onChangeText={handleChange('password')}
                    error={touched.password && errors.password ? errors.password : undefined}
                    secureTextEntry
                  />

                  {error ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  <Button
                    title="Sign In"
                    onPress={handleSubmit as any}
                    loading={loading}
                    style={styles.button}
                  />
                </>
              )}
            </Formik>

            <Button
              title="Forgot Password?"
              variant="outline"
              onPress={handleForgotPassword}
              style={styles.linkButton}
            />

            <Button
              title="Don't have an account? Sign Up"
              variant="outline"
              onPress={handleSignUp}
              style={styles.linkButton}
            />
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.dark,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  linkButton: {
    marginTop: theme.spacing.sm,
  },
  errorContainer: {
    marginVertical: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.danger + '20',
    borderRadius: 8,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.typography.body2.fontSize,
    textAlign: 'center',
  },
});

export default LoginScreen;
