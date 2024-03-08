// Copyright 2023 UDSM DHIS2 Lab. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
export class HeaderBarNotification {
  unreadInterpretations?: number;
  unreadMessageConversations?: number;

  constructor(notification: Record<string, number>) {
    this.unreadInterpretations = notification['unreadInterpretations'];
    this.unreadMessageConversations =
      notification['unreadMessageConversations'];
  }
}
