import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';

import { Button, Input, Card } from '../../components';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import authService from '../../services/authService';
import theme from '../../theme';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../navigation/types';

type ForgotPasswordScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList, 'ForgotPassword'>,
  StackNavigationProp<RootStackParamList>
>;

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const initialValues: ForgotPasswordFormValues = {
    email: '',
  };

  const handleResetPassword = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await authService.resetPassword(values.email);
      setSuccess(true);
      Alert.alert(
        'Email Sent',
        'Password reset instructions have been sent to your email address.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Card style={styles.card}>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We&apos;ve sent password reset instructions to your email address.
          </Text>
          <Button title="Back to Login" onPress={handleBackToLogin} style={styles.button} />
        </Card>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </Text>

            <Formik
              initialValues={initialValues}
              validationSchema={forgotPasswordSchema}
              onSubmit={handleResetPassword}
            >
              {({ handleChange, handleSubmit, values, errors, touched }) => (
                <>
                  <Input
                    label="Email Address"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    error={touched.email && errors.email ? errors.email : undefined}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Button
                    title="Send Reset Instructions"
                    onPress={handleSubmit as any}
                    loading={loading}
                    style={styles.button}
                  />

                  <Button
                    title="Back to Login"
                    variant="outline"
                    onPress={handleBackToLogin}
                    style={styles.linkButton}
                  />
                </>
              )}
            </Formik>
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
  successContainer: {
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
  successTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold' as const,
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  successMessage: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.gray[700],
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  linkButton: {
    marginTop: theme.spacing.sm,
  },
});

export default ForgotPasswordScreen;
