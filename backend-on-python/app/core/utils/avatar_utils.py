from typing import Optional, Dict, Any
import urllib.parse


def generate_avatar_url(user_data: Optional[Dict[str, Any]]) -> str:
    if not user_data:
        return "https://ui-avatars.com/api/?name=U&background=random&color=fff&size=128"
    
    if user_data.get('avatar_url'):
        return user_data['avatar_url']
    
    display_name = user_data.get('display_username', user_data.get('username', 'U'))
    initials = ''.join(word[0].upper() for word in display_name.split()[:2])
    
    encoded_initials = urllib.parse.quote(initials)
    return f"https://ui-avatars.com/api/?name={encoded_initials}&background=random&color=fff&size=128"


def generate_avatar_from_username(username: str, size: int = 128) -> str:
    if not username:
        return f"https://ui-avatars.com/api/?name=U&background=random&color=fff&size={size}"
    
    initials = ''.join(word[0].upper() for word in username.split()[:2])
    encoded_initials = urllib.parse.quote(initials)
    return f"https://ui-avatars.com/api/?name={encoded_initials}&background=random&color=fff&size={size}"


def generate_system_avatar(system_name: str = "Jinaq", size: int = 128) -> str:
    initials = ''.join(word[0].upper() for word in system_name.split()[:2])
    encoded_initials = urllib.parse.quote(initials)
    return f"https://ui-avatars.com/api/?name={encoded_initials}&background=4f46e5&color=fff&size={size}"