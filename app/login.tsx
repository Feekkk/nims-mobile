import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { Eye, EyeOff, TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/auth-context';

const USERNAME = 'test';
const PASSWORD = 'test';

export default function LoginScreen() {
  const { isAuthenticated, signIn } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  const handleLogin = () => {
    setError('');
    setIsSubmitting(true);

    if (username === USERNAME && password === PASSWORD) {
      signIn();
      return;
    }

    setError('Invalid username or password');
    setIsSubmitting(false);
  };

  return (
    <Box className="flex-1 justify-center bg-background px-6">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <VStack space="md">
          <Image
            source={require('@/assets/images/logo-nims.png')}
            style={{ width: 280, height: 80, alignSelf: 'center', marginBottom: 8 }}
            contentFit="contain"
          />

          <Heading size="lg" className="text-center text-foreground">
            Welcome back
          </Heading>
          <Text className="mb-2 text-center text-muted-foreground">
            Sign in to continue to NexCheck
          </Text>

          <VStack space="xs">
            <Text className="font-semibold text-foreground">Username</Text>
            <Input className="h-12" isDisabled={isSubmitting}>
              <InputField
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setUsername}
                placeholder="Enter username"
                value={username}
              />
            </Input>
          </VStack>

          <VStack space="xs">
            <Text className="font-semibold text-foreground">Password</Text>
            <Input className="h-12" isDisabled={isSubmitting}>
              <InputField
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry={!showPassword}
                value={password}
              />
              <InputSlot className="pr-3" onPress={() => setShowPassword((current) => !current)}>
                <InputIcon as={showPassword ? EyeOff : Eye} />
              </InputSlot>
            </Input>
          </VStack>

          {error ? (
            <Alert variant="destructive">
              <AlertIcon as={TriangleAlert} />
              <AlertText>{error}</AlertText>
            </Alert>
          ) : null}

          <Button className="mt-2" isDisabled={isSubmitting} onPress={handleLogin} size="lg">
            {isSubmitting ? <ButtonSpinner color="white" /> : <ButtonText>Log in</ButtonText>}
          </Button>
        </VStack>
      </KeyboardAvoidingView>
    </Box>
  );
}
