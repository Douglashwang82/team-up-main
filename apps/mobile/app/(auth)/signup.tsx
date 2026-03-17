import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSignup = async () => {
    const newErrors: Record<string, string> = {};

    if (!firstName) newErrors.firstName = "請輸入名字";
    if (!lastName) newErrors.lastName = "請輸入姓氏";
    if (!email) newErrors.email = "請輸入電子郵件";
    if (!password) newErrors.password = "請輸入密碼";
    if (password !== confirmPassword) newErrors.confirmPassword = "密碼不相符";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const displayName = `${firstName} ${lastName}`;
      await signup(email, password, displayName);
      // Navigation will be handled automatically by the root layout
    } catch (error) {
      setLoading(false);
      setErrors({
        email:
          error instanceof Error ? error.message : "註冊失敗，請稍後重試。",
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInDown.springify().damping(15).delay(100)} style={styles.header}>
            <Text style={styles.title}>Welcome 🙌</Text>
            <Text style={styles.subtitle}>加入 Team-Up，發掘專屬於你的運動宇宙</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.springify().damping(15).delay(300)} style={styles.form}>
            <View style={styles.row}>
              <Input
                label="名字"
                placeholder="小美"
                value={firstName}
                onChangeText={setFirstName}
                error={errors.firstName}
                style={styles.halfInput}
              />
              <View style={styles.spacer} />
              <Input
                label="姓氏"
                placeholder="陳"
                value={lastName}
                onChangeText={setLastName}
                error={errors.lastName}
                style={styles.halfInput}
              />
            </View>

            <Input
              label="電子郵件"
              placeholder="請輸入您的電子郵件"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="密碼"
              placeholder="請設定密碼"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
            />

            <Input
              label="確認密碼"
              placeholder="請再次輸入密碼"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              secureTextEntry
            />

            <Button
              title="建立帳號"
              onPress={handleSignup}
              loading={loading}
              fullWidth
              size="large"
              style={styles.signupButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>已經有帳號？ </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.loginLink}>登入</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.gray[900],
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: "center",
    marginBottom: 16,
  },
  form: {
    width: "100%",
    backgroundColor: "white",
    padding: 24,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    width: "100%",
  },
  halfInput: {
    flex: 1,
  },
  spacer: {
    width: 12,
  },
  signupButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: Colors.gray[600],
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
