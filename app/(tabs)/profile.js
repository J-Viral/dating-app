import { View, Text, Button } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome 👋</Text>
      <Text>Email: {user?.email}</Text>

      <Button title="Logout" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}
