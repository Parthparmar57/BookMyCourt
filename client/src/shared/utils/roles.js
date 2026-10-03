// Maps a user role to the landing route for that role's workspace.
export const ROLE_HOME = {
  OWNER: '/admin',
  FRONT_DESK: '/staff/frontdesk',
  BAR_STAFF: '/staff/bar',
  SHOP_STAFF: '/staff/shop',
  KITCHEN: '/staff/kitchen',
  MEMBER: '/member',
};

export const roleHomePath = (role) => ROLE_HOME[role] || '/';
