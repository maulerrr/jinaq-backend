import datetime
import pytz #надо добавить в pyproject.toml в зависимости
from typing import Optional


def kz_strftime(dt: Optional[datetime.datetime], format_str: str = '%d.%m.%Y в %H:%M') -> str:
    if dt is None:
        return 'Недавно'
    
    kz_tz = pytz.timezone('Asia/Almaty')
    
    if dt.tzinfo is None:
        dt = pytz.UTC.localize(dt)
    
    return dt.astimezone(kz_tz).strftime(format_str)


def format_datetime(value: Optional[datetime.datetime], format: str = '%d %B %Y %H:%M') -> str:
    if value is None:
        return ""
    if not isinstance(value, datetime.datetime):
        return str(value)
    
    ru_months = {
        'January': 'января', 'February': 'февраля', 'March': 'марта',
        'April': 'апреля', 'May': 'мая', 'June': 'июня',
        'July': 'июля', 'August': 'августа', 'September': 'сентября',
        'October': 'октября', 'November': 'ноября', 'December': 'декабря',
        'Jan': 'янв', 'Feb': 'фев', 'Mar': 'мар', 'Apr': 'апр',
        'Jun': 'июн', 'Jul': 'июл', 'Aug': 'авг', 'Sep': 'сен',
        'Oct': 'окт', 'Nov': 'ноя', 'Dec': 'дек'
    }
    
    ru_days = {
        'Monday': 'понедельник', 'Tuesday': 'вторник', 'Wednesday': 'среда',
        'Thursday': 'четверг', 'Friday': 'пятница', 'Saturday': 'суббота', 'Sunday': 'воскресенье',
        'Mon': 'пн', 'Tue': 'вт', 'Wed': 'ср', 'Thu': 'чт', 'Fri': 'пт', 'Sat': 'сб', 'Sun': 'вс'
    }
    
    kazakhstan_tz = pytz.timezone('Asia/Almaty')
    
    if value.tzinfo is None:
        value = pytz.UTC.localize(value)
    
    value = value.astimezone(kazakhstan_tz)
    result = value.strftime(format)
    
    for eng, rus in ru_months.items():
        result = result.replace(eng, rus)
    
    for eng, rus in ru_days.items():
        result = result.replace(eng, rus)
    
    return result


def get_current_kz_time() -> datetime.datetime:
    kz_tz = pytz.timezone('Asia/Almaty')
    return datetime.datetime.now(kz_tz)


def utc_to_kz_time(utc_dt: datetime.datetime) -> datetime.datetime:
    kz_tz = pytz.timezone('Asia/Almaty')
    if utc_dt.tzinfo is None:
        utc_dt = pytz.UTC.localize(utc_dt)
    return utc_dt.astimezone(kz_tz)