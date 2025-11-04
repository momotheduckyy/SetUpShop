from repo.users_functions import add_user, auth_user, delete_user, check_usernames

# 1. Add a new user
print("Adding user...")
new_user = add_user("noelle", "Noelle Fox", "noelle@example.com", "mypassword")
print(new_user)

# 2. Authenticate with username
print("Auth by username...")
print(auth_user("noelle", "mypassword"))

# 3. Authenticate with email
print("Auth by email...")
print(auth_user("noelle@example.com", "mypassword"))

# 4. Search usernames
print("Searching users...")
print(check_usernames("noe"))

# 5. Delete user
print("Deleting user...")
print(delete_user(new_user["id"]))

# 6. Try authenticating again (should fail)
print("Auth after delete...")
print(auth_user("noelle", "mypassword"))
