# Terminally

Applies a configuration of a terminal arrangement, read from a `.terminally` file in the current workspace.

![image](https://user-images.githubusercontent.com/3382344/233484902-f89ad492-63e7-4f12-b707-7573b322bdb4.png)

Example configuration file:

```json
{
  "groups": [
    {
      "terminals": [
        {
          "title": "terminal 1",
          "command": "echo 'terminal 1'"
        },
        {
          "title": "terminal 2",
          "command": "echo 'terminal 2'"
        },
        {
          "title": "terminal 3",
          "command": "echo 'terminal 3'"
        }
      ]
    },
    {
      "terminals": [
        {
          "title": "terminal 1",
          "command": "echo 'terminal 1'"
        },
        {
          "title": "terminal 2",
          "command": "echo 'terminal 2'"
        }
      ]
    }
  ]
}
```
