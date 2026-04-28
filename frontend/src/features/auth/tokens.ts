export const authTokens = {
  copy: {
    login: {
      title: "Bem-vindo de volta",
      subtitle: "Entra com as tuas credenciais ou continua com uma conta social.",
      missingFields: "Preenche todos os campos",
      emailLabel: "Email",
      passwordLabel: "Password",
      forgotPassword: "Esqueceste a password?",
      submit: "Entrar",
      submitting: "A entrar...",
      noAccountPrefix: "Ainda não tens conta?",
      registerCta: "Regista-te",
    },
    register: {
      title: "Criar conta",
      subtitle: "Cria a tua conta com email e password, ou usa um provedor social.",
      missingFields: "Preenche todos os campos",
      passwordMismatch: "As passwords não coincidem. Tenta novamente.",
      emailLabel: "Email",
      phoneLabel: "Telemóvel",
      passwordLabel: "Nova Password",
      confirmPasswordLabel: "Confirmar Password",
      submit: "Criar Conta",
      submitting: "A criar conta...",
      hasAccountPrefix: "Já tens conta?",
      loginCta: "Entrar",
    },
    recover: {
      title: "Recover Account",
      subtitle: "Enter the email of your account to receive a password reset link",
      missingEmail: "Prenche todas as celulas",
      requestOk: "Pedido enviado com sucesso!",
      submit: "Send Reset Link",
    },
  },
} as const

