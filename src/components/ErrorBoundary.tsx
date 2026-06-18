import React from 'react';
import { Appearance, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const dark = Appearance.getColorScheme() === 'dark';
    const s = dark ? darkStyles : lightStyles;

    return (
      <View style={s.container}>
        <Text style={s.title}>Something went wrong</Text>
        <Text style={s.message}>
          An unexpected error occurred.{'\n'}Your data is safe — restart to continue.
        </Text>
        <TouchableOpacity style={s.button} onPress={this.handleRestart} activeOpacity={0.85}>
          <Text style={s.buttonText}>Restart App</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const base = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  message: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  button: { borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14, backgroundColor: '#10b981' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

const darkStyles = StyleSheet.create({
  container: { ...base.container, backgroundColor: '#0a0a0a' },
  title: { ...base.title, color: '#fff' },
  message: { ...base.message, color: '#888' },
  button: base.button,
  buttonText: base.buttonText,
});

const lightStyles = StyleSheet.create({
  container: { ...base.container, backgroundColor: '#fff' },
  title: { ...base.title, color: '#111' },
  message: { ...base.message, color: '#666' },
  button: base.button,
  buttonText: base.buttonText,
});
