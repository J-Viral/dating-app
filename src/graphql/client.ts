import { ApolloClient, InMemoryCache, ApolloLink, Observable } from '@apollo/client';
import { supabase } from '../config/supabase';

/**
 * Custom Apollo Link to bridge GraphQL mutations to Supabase Auth calls.
 * This allows the components to use standard useMutation hooks.
 */
const supabaseAuthLink = new ApolloLink((operation) => {
    return new Observable((observer) => {
        const { operationName, variables } = operation;

        const executeAuthAction = async () => {
            try {
                let result: any;

                switch (operationName) {
                    case 'SignIn':
                        result = await supabase.auth.signInWithPassword({
                            email: variables.email,
                            password: variables.password,
                        });
                        break;

                    case 'SignUp':
                        result = await supabase.auth.signUp({
                            email: variables.email,
                            password: variables.password,
                            options: {
                                data: { username: variables.username },
                            },
                        });
                        break;

                    case 'SignOut':
                        result = await supabase.auth.signOut();
                        break;

                    case 'ForgotPassword':
                        result = await supabase.auth.resetPasswordForEmail(variables.email, {
                            redirectTo: variables.redirectTo || 'desidates://reset-password',
                        });
                        break;

                    case 'UpdatePassword':
                        result = await supabase.auth.updateUser({
                            password: variables.password,
                        });
                        break;

                    case 'SignInWithGoogle':
                        // Google OAuth is handled separately via expo-auth-session, 
                        // but we can trigger the supabase call here if needed
                        result = await supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                                redirectTo: variables.redirectTo || 'desidates://google-auth',
                            }
                        });
                        break;

                    default:
                        throw new Error(`Unknown auth operation: ${operationName}`);
                }

                if (result.error) {
                    observer.error(result.error);
                } else {
                    observer.next({ data: { [operationName]: result.data || { success: true } } });
                    observer.complete();
                }
            } catch (err: any) {
                observer.error(err);
            }
        };

        executeAuthAction();
    });
});

export const client = new ApolloClient({
    link: supabaseAuthLink,
    cache: new InMemoryCache(),
});
