import json
from django.http import JsonResponse
from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
import random
import time
from .models import Room
from django.views.decorators.csrf import csrf_exempt
# Create your views here.


def generate_token(request):
    appId = 'paste your app id'
    appCertificate = 'paste your app certificate'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 232)
    expiration_time_seconds = 3600 * 12
    current_time_stamp = time.time()
    privilegeExpiredTs = current_time_stamp + expiration_time_seconds
    role = 1
    token = RtcTokenBuilder.buildTokenWithUid(
        appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token': token, 'uid': uid}, safe=False)


def lobby(request):
    return render(request, 'base/lobby.html')


def room(request):
    return render(request, 'base/room.html')


@csrf_exempt
def new_user(request):
    data = json.loads(request.body)
    member, created = Room.objects.get_or_create(
        username=data['username'],
        uid=data['UID'],
        room_name=data['room_name']
    )
    return JsonResponse({'username': data['username']}, safe=False)


def get_another_user(request):
    # getting the parameters with GET request
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')

    # quering the another user
    member = Room.objects.get(
        uid=uid,
        room_name=room_name,
    )
    # Return back the username
    username = member.username
    return JsonResponse({'username': member.username}, safe=False)
