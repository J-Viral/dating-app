// Navigation types
import { UserProfile } from '../types/profile';

export type RootStackParamList = {
    Auth: undefined;
    MainApp: undefined;
    Onboarding: undefined;
};

export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    Signup: undefined;
    PhoneAuth: undefined;
};

export type MainTabParamList = {
    Discovery: undefined;
    Matches: undefined;
    DateIdeas: undefined;
    Chat: undefined;
    Profile: undefined;
};

export type ProfileStackParamList = {
    ProfileView: undefined;
    EditProfile: undefined;
    Settings: undefined;
    Verification: undefined;
    Subscription: undefined;
};

export type ChatStackParamList = {
    Conversations: undefined;
    ChatRoom: { 
        matchId: string; 
        otherUserId: string;
        otherUserName: string;
        otherUserPhoto?: string;
    };
};

export type MainStackParamList = {
    MainApp: undefined;
    ChatRoom: { 
        matchId: string; 
        otherUserId: string;
        otherUserName: string;
        otherUserPhoto?: string;
    };
    EditProfile: undefined;
    Settings: undefined;
};

export type DiscoveryStackParamList = {
    Feed: undefined;
    ProfileDetail: { userId: string };
};
