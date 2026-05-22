# Pleny Restaurant API

Built with NestJS, MongoDB, and Mongoose as part of the Pleny technical assessment.

## Setup

```bash
npm install
```

Create a `.env` file in the root folder:
```
MONGODB_URI=mongodb://localhost:27017/pleny-restaurant
PORT=3000
```

Make sure MongoDB is running then start the server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger docs at `http://localhost:3000/api/docs`

---

## Endpoints

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /restaurants | Create a new restaurant |
| GET | /restaurants | List all restaurants (filter by ?cuisine=Pizza) |
| GET | /restaurants/nearby?longitude=&latitude= | Find restaurants within 1KM |
| GET | /restaurants/:idOrSlug | Get a restaurant by ID or slug |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /users | Create a new user |
| GET | /users | List all users |
| GET | /users/:id | Get a user by ID |

### Follows & Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /users/:id/follow | Follow a restaurant |
| GET | /users/:id/following | List restaurants followed by a user |
| GET | /users/:id/recommendations | Get restaurant recommendations |

---

## How Recommendations Work

The recommendations endpoint uses a MongoDB aggregation pipeline with 3 steps:

1. Find other users who share the same favourite cuisines as the input user
2. Get all restaurants followed by those users
3. Return both the similar users and the recommended restaurants

---

## Notes

- Slugs are unique and lowercase — used as a human-readable identifier for each restaurant
- Location is stored as a GeoJSON Point which enables the nearby search using MongoDB's $near operator
- Each restaurant can have between 1 and 3 cuisines
- A user can only follow a restaurant once
## Author

**Zeyad Waheed Fahmy, Backend - Full Stack Developer / TA**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://www.linkedin.com/in/zeyad-waheed-871725269)
