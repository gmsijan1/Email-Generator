import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../contexts/useAuth";
import "./ProfileMenu.css";

export default function ProfileMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
        setShowLogoutConfirm(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      // ignore
    }
  }

  function handleMyData() {
    setShowMenu(false);
    navigate("/profile");
  }

  if (!currentUser) return null;

  return (
    <div className="profile-menu-wrapper" ref={menuRef}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="profile-menu-icon"
        aria-label="Profile menu"
      >
        {currentUser?.email?.charAt(0).toUpperCase()}
      </button>

      {showMenu && (
        <div className="profile-menu-dropdown">
          <div className="profile-menu-email">
            <span className="profile-menu-email-label">Signed in as</span>
            <span className="profile-menu-email-value">{currentUser?.email}</span>
          </div>

          <button
            type="button"
            className="profile-menu-item"
            onClick={handleMyData}
          >
            My Data
          </button>

          <button
            type="button"
            className="profile-menu-item profile-menu-item-disabled"
            disabled
          >
            Billing
          </button>

          {!showLogoutConfirm ? (
            <button
              type="button"
              className="profile-menu-item profile-menu-item-logout"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Log Out
            </button>
          ) : (
            <div className="profile-menu-logout-confirm">
              <span>Are you sure?</span>
              <div className="profile-menu-logout-buttons">
                <button
                  type="button"
                  className="profile-menu-btn profile-menu-btn-cancel"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    setShowMenu(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="profile-menu-btn profile-menu-btn-logout"
                  onClick={handleLogout}
                >
                  Yes
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
