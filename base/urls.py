from django.urls import path
from . import views


urlpatterns = [
    path('', views.lobby),
    path('room/', views.room),
    path('get-token/', views.generate_token),
    path('new-user/', views.new_user),
    path('get-another-user/', views.get_another_user),
]
