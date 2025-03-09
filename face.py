import cv2
import numpy as np
from keras_facenet import FaceNet
from mtcnn import MTCNN
from scipy.spatial.distance import cosine, euclidean

embedder = FaceNet()
detector = MTCNN()


def get_embedding(img_bytes):
    img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
    img = cv2.resize(img, (480, int(img.shape[1] * 480 / img.shape[0])))

    faces = detector.detect_faces(img)

    face = faces[0]
    x, y, w, h = face['box']

    img = img[y:y+h, x:x+w]

    img = cv2.resize(img, (180, int(img.shape[1] * 180 / img.shape[0])))
    img = np.expand_dims(img, axis=0)

    embedding = embedder.embeddings(img)[0]
    return embedding


def verify_faces(saved_img, test_img):
    emb1 = get_embedding(saved_img)
    emb2 = get_embedding(test_img)

    distance = euclidean(emb1, emb2)
    similarity = 1 - cosine(emb1, emb2)

    if distance <= 0.6 or similarity >= 0.7:
        return True

    return False
