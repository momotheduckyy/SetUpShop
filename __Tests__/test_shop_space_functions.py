# tests/test_shop_space_functions.py
import pytest

# ⚠️ Update this import path if needed
import repo.shop_space_functions as shop

# 1) create_shop_space — success
def test_create_shop_space_success(seed_user):
    sp = shop.create_shop_space(seed_user, "Garage A", 6.5, 4.2, 2.7)
    assert sp["shop_id"].startswith(f"{seed_user}_Garage A_")
    assert sp["username"] == seed_user
    assert sp["shop_name"] == "Garage A"
    assert sp["length"] == 6.5 and sp["width"] == 4.2 and sp["height"] == 2.7
    assert sp["equipment"] == []

# 2) create_shop_space — invalid username -> ValueError
def test_create_shop_space_invalid_user():
    with pytest.raises(ValueError):
        shop.create_shop_space("no_such_user", "BadSpace", 1, 1, 1)

# 3) get_shop_space_by_id — found
def test_get_shop_space_by_id_found(seed_shop_space):
    found = shop.get_shop_space_by_id(seed_shop_space["shop_id"])
    assert found is not None
    assert found["shop_id"] == seed_shop_space["shop_id"]
    assert found["shop_name"] == "MySpace"

# 4) get_shop_space_by_id — not found -> None
def test_get_shop_space_by_id_not_found():
    assert shop.get_shop_space_by_id("does_not_exist") is None

# 5) update_shop_space_dimensions — partial update persists
def test_update_shop_space_dimensions_partial(seed_shop_space):
    sid = seed_shop_space["shop_id"]
    updated = shop.update_shop_space_dimensions(sid, width=9.25)  # only width
    assert updated["length"] == seed_shop_space["length"]          # unchanged
    assert updated["width"] == 9.25                                 # changed
    assert updated["height"] == seed_shop_space["height"]           # unchanged

# 6) update_shop_space_dimensions — bad id -> ValueError
def test_update_shop_space_dimensions_bad_id():
    with pytest.raises(ValueError):
        shop.update_shop_space_dimensions("nope", length=12)

# 7) add_equipment_to_shop_space — success + coordinate fields retained
def test_add_equipment_to_shop_space_success(seed_shop_space, seed_equipment):
    sid = seed_shop_space["shop_id"]
    after = shop.add_equipment_to_shop_space(sid, seed_equipment, 1.0, 2.0, 0.0)
    eq = after["equipment"]
    assert isinstance(eq, list) and len(eq) == 1
    rec = eq[0]
    assert rec["equipment_id"] == seed_equipment
    assert rec["x_coordinate"] == 1.0
    assert rec["y_coordinate"] == 2.0
    assert rec["z_coordinate"] == 0.0
    assert "date_added" in rec

# 8) add_equipment_to_shop_space — invalid equipment -> ValueError
def test_add_equipment_to_shop_space_invalid_equipment(seed_shop_space):
    with pytest.raises(ValueError):
        shop.add_equipment_to_shop_space(seed_shop_space["shop_id"], 99999, 0, 0, 0)

# 9) remove_equipment_from_shop_space — success (list shrinks / empty)
def test_remove_equipment_from_shop_space_success(seed_shop_space, seed_equipment):
    sid = seed_shop_space["shop_id"]
    # add then remove
    after_add = shop.add_equipment_to_shop_space(sid, seed_equipment, 0, 0, 0)
    assert len(after_add["equipment"]) == 1
    after_remove = shop.remove_equipment_from_shop_space(sid, seed_equipment)
    assert after_remove["equipment"] == []

# 10) delete_shop_space + lists (by username/all) reflect change
def test_delete_and_listing(seed_user):
    a = shop.create_shop_space(seed_user, "A", 3, 3, 3)
    b = shop.create_shop_space(seed_user, "B", 3, 3, 3)
    # list by username should include both
    owned = shop.get_shop_spaces_by_username(seed_user)
    ids = {s["shop_id"] for s in owned}
    assert a["shop_id"] in ids and b["shop_id"] in ids

    # delete one
    ok = shop.delete_shop_space(a["shop_id"])
    assert ok is True

    # lists reflect deletion
    owned_after = shop.get_shop_spaces_by_username(seed_user)
    ids_after = {s["shop_id"] for s in owned_after}
    assert a["shop_id"] not in ids_after and b["shop_id"] in ids_after

    # get_all also works (smoke check)
    all_spaces = shop.get_all_shop_spaces()
    assert isinstance(all_spaces, list)
