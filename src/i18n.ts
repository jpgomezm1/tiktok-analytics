// Spanish translations dictionary
const dictionary = {
  auth: {
    signIn: "Iniciar sesión",
    signUp: "Registrarse",
    email: "Correo electrónico",
    password: "Contraseña",
    displayName: "Nombre de usuario",
    enterEmail: "Ingresa tu correo",
    enterPassword: "Ingresa tu contraseña",
    createPassword: "Crea una contraseña",
    nameOrBrand: "Tu nombre o marca",
    signingIn: "Iniciando sesión...",
    creatingAccount: "Creando cuenta...",
    createAccount: "Crear cuenta",
    getStarted: "Empezar",
    signInDescription: "Inicia sesión en tu cuenta o crea una nueva para comenzar a analizar tu rendimiento en TikTok",
    signInFailed: "Error al iniciar sesión",
    signUpFailed: "Error al registrarse",
    welcomeBack: "¡Bienvenido de nuevo!",
    successSignIn: "Has iniciado sesión exitosamente en tu panel de análisis.",
    accountCreated: "¡Cuenta creada!",
    checkEmail: "Revisa tu correo para verificar tu cuenta.",
    invalidCredentials: "Correo o contraseña inválidos",
    forgotPassword: "¿Olvidaste tu contraseña?"
  },
  nav: {
    dashboard: "Panel",
    videos: "Videos",
    analytics: "Análisis",
    settings: "Configuración",
    logout: "Cerrar sesión"
  },
  common: {
    save: "Guardar",
    export: "Exportar",
    analyze: "Analizar",
    back: "Atrás",
    loading: "Cargando...",
    error: "Ocurrió un error",
    search: "Buscar",
    filter: "Filtrar",
    sort: "Ordenar",
    add: "Agregar",
    edit: "Editar",
    delete: "Eliminar",
    view: "Ver",
    close: "Cerrar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    yes: "Sí",
    no: "No",
    success: "Éxito",
    warning: "Advertencia",
    info: "Información"
  },
  dashboard: {
    title: "Panel",
    welcomeBack: "Bienvenido de nuevo",
    emptyTitle: "¿Listo para analizar tu rendimiento en TikTok?",
    emptyDescription: "Comienza agregando tu primer video o importando tus datos existentes de TikTok para desbloquear insights poderosos y oportunidades de crecimiento.",
    addFirstVideo: "Agregar tu primer video",
    importData: "Importar datos",
    importCSVData: "Importar CSV",
    addVideo: "Agregar video",
    loadingAnalytics: "Cargando tu análisis...",
    keyMetrics: "Métricas clave",
    performanceOverview: "Resumen de rendimiento",
    last30Days: "Últimas 30 días tendencias de rendimiento",
    topPerformers: "Mejores rendimientos",
    topPerformersDesc: "Tus videos con mejor rendimiento este mes",
    recentVideos: "Videos recientes",
    recentVideosDesc: "Rendimiento de tu contenido más reciente",
    noTopPerformers: "Aún no hay mejores rendimientos",
    noVideos: "Aún no se han agregado videos"
  },
  metrics: {
    totalFollowers: "Seguidores totales",
    avgViews: "Vistas promedio",
    engagementRate: "Tasa de engagement",
    viralVideos: "Videos virales",
    views: "Vistas",
    likes: "Me gusta",
    comments: "Comentarios",
    shares: "Compartidos",
    saves: "Guardados",
    duration: "Duración",
    publishedDate: "Fecha de publicación",
    performance: "Rendimiento",
    viral: "🔥 Viral",
    good: "✅ Bueno",
    medium: "🔸 Medio",
    low: "❌ Bajo",
    thisMonth: "Este mes",
    vsLastMonth: "vs mes pasado",
    increase: "aumento",
    decrease: "disminución"
  },
  videos: {
    title: "Videos",
    description: "Gestiona y analiza tu biblioteca de contenido de TikTok",
    searchPlaceholder: "Buscar por título...",
    sortBy: "Ordenar por",
    sortByPerformance: "Ordenar por rendimiento",
    sortBySaves: "Ordenar por guardados/1K",
    sortByEngagement: "Ordenar por tasa de engagement",
    gridView: "Vista de cuadrícula",
    listView: "Vista de lista",
    noVideosFound: "No se encontraron videos",
    emptyStateTitle: "Empieza a analizar tu rendimiento",
    emptyStateDescription: "Sube tus videos o importa tu data de TikTok para ver patrones, métricas y oportunidades de crecimiento.",
    viewExternal: "Ver en TikTok",
    videoNotFound: "Video no encontrado",
    backToVideos: "Volver a videos",
    script: "Guión",
    trafficSources: "Fuentes de tráfico"
  },
  analyzer: {
    viralPotential: "Analizador de Potencial Viral",
    contentSuggestions: "Sugerencias de Contenido IA",
    generateIdeas: "Generar ideas",
    analyzing: "Analizando...",
    confidenceScore: "Puntuación de confianza",
    recommendations: "Recomendaciones",
    examples: "Ejemplos",
    noExamplesYet: "Aún no hay ejemplos para este patrón, sube más videos",
    insights: "Insights",
    aiInsights: "Ideas de contenido IA",
    aiInsightsDescription: "Análisis inteligente y recomendaciones basadas en tu contenido más exitoso",
    generateInsights: "Generar insights",
    clickToGenerate: "Haz clic en \"Generar ideas\" para obtener recomendaciones personalizadas basadas en el análisis de tu contenido."
  },
  errors: {
    generic: "Algo salió mal. Por favor, inténtalo de nuevo.",
    network: "Error de conexión. Verifica tu internet.",
    unauthorized: "No autorizado. Por favor, inicia sesión nuevamente.",
    notFound: "Recurso no encontrado.",
    validation: "Error de validación. Verifica los datos ingresados.",
    timeout: "La solicitud tardó demasiado. Inténtalo de nuevo.",
    insufficient: "No hay suficientes datos para mostrar gráficos"
  },
  chart: {
    views: "Vistas",
    engagementRate: "Tasa de Engagement (%)",
    noData: "No hay datos suficientes para graficar",
    last30Days: "Últimos 30 días"
  },
  settings: {
    title: "Configuración",
    aiSettings: "Configuración de IA",
    apiConfiguration: "Configuración de API",
    analysisFrequency: "Frecuencia de análisis",
    aiFeatures: "Características de IA",
    saveSettings: "Guardar configuración",
    saving: "Guardando...",
    settingsSaved: "Configuración guardada",
    settingsUpdated: "Tu configuración ha sido actualizada correctamente."
  },
  forms: {
    required: "Este campo es obligatorio",
    invalidEmail: "Formato de correo inválido",
    passwordTooShort: "La contraseña debe tener al menos 6 caracteres",
    submit: "Enviar",
    reset: "Reiniciar"
  }
};

// Create a hook to access translations
export const useT = (key: string): string => {
  const keys = key.split('.');
  let value: any = dictionary;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Return missing key indicator if translation not found
      return `⚠️[MISSING: ${key}]`;
    }
  }
  
  return typeof value === 'string' ? value : `⚠️[MISSING: ${key}]`;
};

export default dictionary;