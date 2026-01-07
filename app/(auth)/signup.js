import { View, Text, TextInput, Button } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error) router.replace('/profile');
    else alert(error.message);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Signup</Text>

      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />

      <Button title="Create Account" onPress={signUp} />
    </View>
  );
}
