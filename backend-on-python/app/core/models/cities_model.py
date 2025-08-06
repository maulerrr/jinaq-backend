from sqlalchemy import BigInteger, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, relationship, mapped_column

from app.core.models.base import Base, TimestampMixin
from app.core.models.countries_model import Country


class City(Base, TimestampMixin):
    __tablename__ = "cities"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    country_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("countries.id"))
    name: Mapped[str] = mapped_column(String, unique=True, index=True)

    country: Mapped["Country"] = relationship()
    institutions = relationship("Institution", back_populates="city")
