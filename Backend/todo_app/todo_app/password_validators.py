# todos/password_validators.py
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class CustomPasswordValidator:
    def __init__(self, min_length=8):
        self.min_length = min_length

    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError(
                _("Hasło musi zawierać co najmniej %(min_length)d znaków."),
                code='password_too_short',
                params={'min_length': self.min_length},
            )
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("Hasło musi zawierać co najmniej jedną dużą literę."),
                code='password_no_upper',
            )
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _("Hasło musi zawierać co najmniej jedną małą literę."),
                code='password_no_lower',
            )
        if not re.search(r'[0-9]', password):
            raise ValidationError(
                _("Hasło musi zawierać co najmniej jedną cyfrę."),
                code='password_no_digit',
            )
        if not re.search(r'[\W_]', password): 
            raise ValidationError(
                _("Hasło musi zawierać co najmniej jeden znak specjalny."),
                code='password_no_special',
            )

    def get_help_text(self):
        return _(
            "Hasło musi zawierać co najmniej %(min_length)d znaków, "
            "w tym jedną dużą literę, jedną małą literę, jedną cyfrę i jeden znak specjalny."
        ) % {'min_length': self.min_length}