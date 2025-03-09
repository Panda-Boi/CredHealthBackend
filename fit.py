import os
import pickle, json
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timedelta

# Scopes needed for the Fitness API
SCOPES = ['https://www.googleapis.com/auth/fitness.activity.read',
          'https://www.googleapis.com/auth/fitness.body.read',
          'https://www.googleapis.com/auth/fitness.location.read',
          'https://www.googleapis.com/auth/fitness.sleep.read',
    ]

STEPS_SRC = 'derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas'
HEART_SRC = 'derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes'
CALORIE_SRC = 'derived:com.google.calories.bmr:com.google.android.gms:merged'
SLEEP_SRC = 'derived:com.google.sleep.segment:com.google.android.gms:merged'

# Path to OAuth 2.0 credentials file 
CLIENT_SECRET_FILE = 'client_secret.json'

# API service details
API_SERVICE_NAME = 'fitness'
API_VERSION = 'v1'

# Create the service
def create_fitness_service():
    creds = None
    # Check if we have saved credentials
    if os.path.exists('token.pkl'):
        with open('token.pkl', 'rb') as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Create new credentials using OAuth flow
            flow = InstalledAppFlow.from_client_secrets_file(
                CLIENT_SECRET_FILE, SCOPES)
            flow.run_local_server(port=8080, prompt='consent')
            creds = flow.credentials
        # Save the credentials for the next run
        with open('token.pkl', 'wb') as token:
            pickle.dump(creds, token)
    
    # Build the service
    service = build(API_SERVICE_NAME, API_VERSION, credentials=creds)
    return service

def fetch_step_data(service):

    cumulative_steps = 0

    try:
        # Call the API to get user's activity data
        dataset = get_time_string()
        data_source = STEPS_SRC
        
        fitness_data = service.users().dataSources().datasets().get(
            userId='me',
            dataSourceId=data_source,
            datasetId=dataset,
        ).execute()
        
        # print('Activity Data:', fitness_data)
        with open('logs/steps.json', 'w') as file:
            file.write(json.dumps(fitness_data))

        # adding up all the individual activity points
        for point in fitness_data['point']:
            cumulative_steps += point['value'][0]['intVal']

    except HttpError as error:
        print(f'An error occurred: {error}')

    return cumulative_steps

def fetch_heart_data(service):

    heart_minutes = 0

    try:
        dataset = get_time_string()
        data_source = HEART_SRC
        
        heart_data = service.users().dataSources().datasets().get(
            userId='me',
            dataSourceId=data_source,
            datasetId=dataset,
        ).execute()

        with open('logs/heart.json', 'w') as file:
            file.write(json.dumps(heart_data))

        # add up individual heart data points
        for point in heart_data['point']:
            heart_minutes += point['value'][0]['fpVal']

    except HttpError as error:
        print(f'An error occurred: {error}')

    return heart_minutes

def fetch_calorie_data(service):

    calories_expended = 0

    try:
        dataset = get_time_string()
        data_source = CALORIE_SRC

        calorie_data = service.users().dataSources().datasets().get(
            userId='me',
            dataSourceId=data_source,
            datasetId=dataset,
        ).execute()
        
        with open('logs/calories.json', 'w') as file:
            file.write(json.dumps(calorie_data))

        calories_expended = calorie_data['point'][0]['value'][0]['fpVal']

    except HttpError as error:
        print(f'An error occurred: {error}')

    return calories_expended

def fetch_sleep_data(service):

    hours_slept = 0

    try:
        # Call the API to get user's sleep data
        dataset = get_time_string()
        data_source = SLEEP_SRC
    
        sleep_data = service.users().dataSources().datasets().get(
            userId='me',
            dataSourceId=data_source,
            datasetId=dataset,
        ).execute()

        # logging sleep data
        with open('logs/sleep.json', 'w') as file:
            file.write(json.dumps(sleep_data))

        for point in sleep_data:
            # hours_slept += point['value'][0]['fpVal']
            continue

    except HttpError as error:
        print(f'An error occurred: {error}')

    hours_slept = 9
    return hours_slept

def get_time_string():
    # Get the current time (now)
    now = datetime.now()

    # Define a 30-minute interval
    start_time = now
    end_time = now - timedelta(minutes=24*60)

    # Convert to Unix time in seconds
    start_time_seconds = int(start_time.timestamp())
    end_time_seconds = int(end_time.timestamp())

    # Convert to nanoseconds (1 second = 1,000,000,000 nanoseconds)
    start_time_ns = start_time_seconds * 1_000_000_000
    end_time_ns = end_time_seconds * 1_000_000_000

    return f"{start_time_ns}-{end_time_ns}"

def log_data_streams(fitness_service):
    list = fitness_service.users().dataSources().list(
        userId='me'
    ).execute()

    with open('logs/list.json', 'w') as file:
        file.write(json.dumps(list))

    sessions = fitness_service.users().sessions().list(
        userId='me'
    ).execute()
    
    with open('logs/sessions.json', 'w') as file:
        file.write(json.dumps(sessions))

    sessions = fitness_service.users().sessions().list(
            userId='me',
            pageToken=sessions['nextPageToken']
        ).execute()

    with open('logs/sessions.json', 'a') as file:
        file.write(json.dumps(sessions))

def calc_activity_score(steps, heart_pts, calories_burned):
    activity_score = 0

    IDEAL_STEPS = 10000
    activity_score += 40 * min(steps / IDEAL_STEPS, 1)

    IDEAL_HEART_PTS = 25
    activity_score += 30 * min(heart_pts / IDEAL_HEART_PTS, 1)

    IDEAL_CALORIES_BURNED = 2000
    activity_score += 30 * min(calories_burned / IDEAL_CALORIES_BURNED, 1)

    return activity_score

def calc_sleep_score(hours_slept):
    IDEAL_SLEEP_HOURS = 8.0

    return 100 * min(hours_slept / IDEAL_SLEEP_HOURS, 1)

def get_health_data():
    # Create the Fitness API service
    fitness_service = create_fitness_service()

    # logging available data streams
    log_data_streams(fitness_service)

    # Fetch user data from the Fitness API
    steps = fetch_step_data(fitness_service)
    heart_pts = fetch_heart_data(fitness_service)
    calories_burned = fetch_calorie_data(fitness_service)
    hours_slept = fetch_sleep_data(fitness_service)

    activity_score = calc_activity_score(steps, heart_pts, calories_burned)
    sleep_score = calc_sleep_score(hours_slept)

    return (activity_score, sleep_score)

if __name__ == '__main__':
    
    activity_score, sleep_score = get_health_data()

    print(f"Activity Score: {activity_score}")
    print(f"Sleep Score: {sleep_score}")