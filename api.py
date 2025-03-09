import pickle
from datetime import datetime

import requests
from fastapi import FastAPI
from pydantic import BaseModel

from face import verify_faces
from food import meal_details
from fit import get_health_data


class MealVerificationRequest(BaseModel):
    saved_face: str
    test_face: str
    meal: str


def download_image(image_url: str):
    response = requests.get(image_url)
    response.raise_for_status()

    return response.content

app = FastAPI()

@app.post('/evaluate-meal/')
def evaluate_meal(request: MealVerificationRequest):
    saved_face_img = download_image(request.saved_face)
    test_face_img = download_image(request.test_face)
    meal_img = download_image(request.meal)

    verified = verify_faces(saved_face_img, test_face_img)
    meal = meal_details(meal_img)

    meal_calories = sum([item['calories'] for item in meal])
    meal_score_weighted = sum([item['score'] * item ['calories'] / meal_calories for item in meal])

    meal_log = {'verified': verified, 'date': datetime.now().strftime('%d-%m-%Y'), 'meal_calories': meal_calories, 'meal_score_weighted': meal_score_weighted, 'meal': meal}

    with open('user.pkl', 'rb') as f:
        data = pickle.load(f)

    data[2].append(meal_log)

    with open('user.pkl', 'wb') as f:
        pickle.dump(data, f)

    return meal_log


def _get_today_score():
    today = datetime.now().strftime('%d-%m-%Y')

    with open('user.pkl', 'rb') as f:
        data = pickle.load(f)
        r_cal = 2000
        max_score = 100
        meals = data[2]

    meals = [meal for meal in meals if meal['verified'] and meal['date'] == today]

    day_cal = sum([meal['meal_calories'] for meal in meals])

    score = (sum([meal['meal_calories'] * meal['meal_score_weighted'] for meal in meals]) - abs(max(0, day_cal - r_cal))) / r_cal * max_score
    score = max(score, 0)
    
    return int(score)


@app.get("/get-scores")
async def get_scores():
    # noinspection PyTupleAssignmentBalance
    scores = *get_health_data(), _get_today_score()

    return {
        'healthScore': (min(scores) + max(scores)) // 2,
        'activityScore': int(scores[0]),
        'sleepScore': int(scores[1]),
        'dietScore': int(scores[2])
    }

try:
    f = open('user.pkl', 'rb')
    _ = pickle.load(f)
except (EOFError, FileNotFoundError):
    f = open('user.pkl', 'wb')
    pickle.dump([2000, 100, []], f)
finally:
    f.close()