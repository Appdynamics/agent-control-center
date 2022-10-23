import Mock from "./mock";

import "./db/auth";
import "./db/ecommerce";
import "./db/notification";
import "./db/users";

Mock.onAny().passThrough();
