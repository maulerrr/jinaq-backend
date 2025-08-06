EMBEDDING_CACHE = {}
SYNONYM_CACHE = {}

NOTIFICATION_TYPES = {
    'project_comment': {
        'icon': '💬',
        'label': 'Project Comment'
    },
    'like_comment': {
        'icon': '❤️',
        'label': 'Comment Liked'
    },
    'reply_comment': {
        'icon': '💬',
        'label': 'Comment Replied'
    },
    'profile_comment': {
        'icon': '📝',
        'label': 'Profile Comment'
    },
    'account_change': {
        'icon': '🌐',
        'label': 'System Notification'
    },
    'verification': {
        'icon': '🏆',
        'label': 'Account Verified'
    },
    'system': {
        'icon': '🌐',
        'label': 'System Notification'
    },
    'project_collaboration': {
        'icon': '👥',
        'label': 'Project Collaboration'
    },
    'project_update': {
        'icon': '🔄',
        'label': 'Project Update'
    },
    'project_invitation': {
        'icon': '📩',
        'label': 'Project Invitation'
    }
}

ENHANCED_NOTIFICATION_TYPES = {
    **NOTIFICATION_TYPES,
    'system': { 
        'icon': '🌐',
        'label': 'System Notification',
        'priority': 'high',
        'sender': {
            'username': 'Jinaq',
            'verified': True,
            'verification_type': 'system'
        }
    },
    'project_comment': {
        'icon': '💬',
        'label': 'Project Comment',
        'priority': 'normal',
    },
    'admin_message': {
        'icon': '🏛️', 
        'label': 'Administrative Message', 
        'priority': 'critical',
        'sender': {
            'username': 'Jinaq Admin',
            'verified': True,
            'verification_type': 'official'
        }
    },
    'important': {
        'icon': '❗', 
        'label': 'Important Notification', 
        'priority': 'high',
        'sender': {
            'username': 'Jinaq Alert',
            'verified': True,
            'verification_type': 'system'
        }
    }
}

VERIFICATION_TYPES = {
    'official': {
        'icon': '🏛️',
        'color': 'blue',
        'label': 'Официальный аккаунт'
    },
    'creator': {
        'icon': '🎨',
        'color': 'purple',
        'label': 'Создатель контента'
    },
    'business': {
        'icon': '💼',
        'color': 'green',
        'label': 'Бизнес-аккаунт'
    }
}

KAZAKHSTAN_CITIES = [
    "Almaty", "Astana", "Shymkent", "Aktobe", "Karaganda", "Taraz", 
    "Pavlodar", "Ust-Kamenogorsk", "Semey", "Atyrau", "Kostanay", 
    "Kyzylorda", "Uralsk", "Petropavlovsk", "Aktau", "Temirtau", 
    "Kokshetau", "Taldykorgan", "Ekibastuz", "Rudny", "Zhanaozen"
]

ADMIN_IDS = ['vVbXL4LKGidXtrKnvqa21gWRY3V2']